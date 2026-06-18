import os
import joblib
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.schemas import (
    MLTrainRequest, MLTrainResponse, MLPredictResponse, MLStatusResponse, MLModelStatus
)
from app.services.weather import weather_service
from app.ml.training_service import training_service
from app.ml.inference_service import inference_service
from app.database import get_db
from app.models import MLModel, MLTrainingRun

router = APIRouter(prefix="/ml", tags=["machine-learning"])
logger = logging.getLogger(__name__)

async def resolve_city(city_query: str, db: Session):
    """Helper to geocode a Brazilian city, matching weather.py implementation"""
    city_normalized = city_query.lower().strip()
    search_parts = city_normalized.split(",")
    search_query = search_parts[0].strip()
    state_query = search_parts[1].strip() if len(search_parts) > 1 else None
    
    # 1. Try to resolve coordinates from local DB tables (SearchHistory / HistoricalQuery)
    # to avoid external geocoding calls and bypass timeout risks.
    from app.models import SearchHistory, HistoricalQuery
    from app.schemas import CitySearchResult
    
    db_city = db.query(SearchHistory).filter(SearchHistory.city_name.ilike(search_query)).first()
    if not db_city:
        db_city = db.query(HistoricalQuery).filter(HistoricalQuery.city_name.ilike(search_query)).first()
        
    if db_city:
        logger.info(f"Resolved city '{search_query}' from database cache: ({db_city.latitude}, {db_city.longitude})")
        return CitySearchResult(
            name=db_city.city_name,
            latitude=db_city.latitude,
            longitude=db_city.longitude,
            state=db_city.state,
            country=db_city.country
        )
    
    # 2. Cache/DB Miss: Fall back to geocoding search API
    cities = await weather_service.search_cities(search_query)
    if not cities:
        raise HTTPException(
            status_code=404, 
            detail=f"Não encontramos nenhuma cidade brasileira com o nome '{city_query}'."
        )
        
    selected_city = None
    if state_query:
        for c in cities:
            if c.state and c.state.lower().strip() == state_query:
                selected_city = c
                break
                
    if not selected_city:
        selected_city = cities[0]
        
    return selected_city

@router.post("/train", response_model=MLTrainResponse)
async def train_ml_models(
    request: MLTrainRequest,
    db: Session = Depends(get_db)
):
    """
    Triggers model training for a specific city. Builds a dataset with 2 years of
    daily weather data, splits it, trains RandomForest models and evaluates them.
    """
    logger.info(f"Received ML training request for city: '{request.city}'")
    city = await resolve_city(request.city, db)
    
    years = request.period_years or 2
    if not (1 <= years <= 5):
        raise HTTPException(
            status_code=400,
            detail="O período de treinamento deve ser de no mínimo 1 ano e no máximo 5 anos."
        )
        
    try:
        results = await training_service.train_models_for_city(
            db=db,
            city_name=city.name,
            lat=city.latitude,
            lon=city.longitude,
            period_years=years
        )
        return results
    except Exception as e:
        logger.error(f"Failed during ML training for {city.name}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro durante o treinamento do modelo para {city.name}: {str(e)}"
        )

@router.get("/predict", response_model=MLPredictResponse)
async def predict_weather(
    city: str = Query(..., min_length=2),
    db: Session = Depends(get_db)
):
    """
    Predicts rain, heavy rain, and risk level for tomorrow based on today's weather indicators.
    Uses trained Random Forest models if available, otherwise falls back to rule-based logic.
    """
    city_resolved = await resolve_city(city, db)
    
    # Fetch today's current weather dashboard details
    weather_data = await weather_service.get_weather(
        lat=city_resolved.latitude,
        lon=city_resolved.longitude,
        city_name=city_resolved.name,
        state=city_resolved.state,
        country=city_resolved.country
    )
    
    if not weather_data:
        raise HTTPException(
            status_code=500,
            detail="Não foi possível obter dados meteorológicos atuais para realizar predições."
        )
        
    current = weather_data.current
    risk = weather_data.risk
    
    # Run prediction through InferenceService
    prediction_result = await inference_service.predict(
        db=db,
        city_name=city_resolved.name,
        lat=city_resolved.latitude,
        lon=city_resolved.longitude,
        current_temp=current.temperature,
        current_humidity=current.relative_humidity,
        current_wind=current.wind_speed,
        current_precip=current.precipitation,
        current_pressure=current.surface_pressure
    )
    
    return prediction_result

@router.get("/status", response_model=MLStatusResponse)
async def get_ml_status(
    city: str = Query(..., min_length=2),
    db: Session = Depends(get_db)
):
    """
    Queries the database to fetch metadata on trained models and runs for a city.
    """
    city_resolved = await resolve_city(city, db)
    
    models = db.query(MLModel).filter(MLModel.city_name == city_resolved.name).all()
    training_runs = db.query(MLTrainingRun).filter(MLTrainingRun.city_name == city_resolved.name).count()
    
    has_trained_models = len(models) >= 3
    
    feature_names = [
        "max_temp", "min_temp", "mean_temp", "rain", "wind_max",
        "rain_prev_day", "rain_rolling_3", "rain_rolling_7", "temp_rolling_7",
        "month", "season", "latitude", "longitude"
    ]
    
    model_statuses = []
    for m in models:
        importances = []
        if m.file_path and os.path.exists(m.file_path):
            try:
                loaded_model = joblib.load(m.file_path)
                if hasattr(loaded_model, "feature_importances_"):
                    imps = loaded_model.feature_importances_
                    importances = [
                        {"feature": name, "importance": round(float(imp), 4)}
                        for name, imp in zip(feature_names, imps)
                    ]
                    importances.sort(key=lambda x: x["importance"], reverse=True)
            except Exception as e:
                logger.error(f"Failed to extract feature importances from {m.file_path}: {e}")
                
        model_statuses.append(
            MLModelStatus(
                city_name=m.city_name,
                model_type=m.model_type,
                algorithm=m.algorithm,
                accuracy=m.accuracy,
                f1_score=m.f1_score,
                trained_at=m.trained_at,
                samples_count=m.samples_count,
                importances=importances if importances else None
            )
        )
        
    return MLStatusResponse(
        city_name=city_resolved.name,
        models=model_statuses,
        has_trained_models=has_trained_models,
        training_runs=training_runs
    )
