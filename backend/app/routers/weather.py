from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from app.schemas import (
    CitySearchResult, WeatherResponse, HistoricalQueryResponse, ComparisonResultResponse
)
from app.services.weather import weather_service
from app.services.cache import cache_service
from app.database import get_db
from app.models import SearchHistory, HistoricalQuery, HistoricalDailyData, ComparisonQuery

router = APIRouter(prefix="", tags=["weather"])
logger = logging.getLogger(__name__)


async def resolve_city(city_query: str, db: Session):
    """Helper to geocode a Brazilian city, using local database caching first"""
    city_normalized = city_query.lower().strip()
    search_parts = city_normalized.split(",")
    search_query = search_parts[0].strip()
    state_query = search_parts[1].strip() if len(search_parts) > 1 else None
    
    # 1. Try resolving coordinates from local database tables to avoid timeouts
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
        
    # 2. Cache/DB Miss: Fall back to Geocoding Search API
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

@router.get("/cities/search", response_model=List[CitySearchResult])
async def search_cities(name: str = Query(..., min_length=2)):
    """Search for Brazilian cities by name"""
    return await weather_service.search_cities(name)

@router.get("/weather/dashboard", response_model=WeatherResponse)
async def get_weather_dashboard(
    city: str = Query(..., min_length=2),
    db: Session = Depends(get_db)
):
    """
    Get meteorological dashboard data for a city.
    Checks Redis cache, resolves coordinates via Geocoding if needed,
    and logs query parameters to PostgreSQL database history.
    """
    city_query = city.lower().strip()
    cache_key = f"weather:dashboard:{city_query}"
    
    # 1. Check Redis Cache
    cached_data = cache_service.get(cache_key)
    if cached_data:
        logger.info(f"Redis Cache hit for dashboard query: '{city_query}'")
        return WeatherResponse(**cached_data)

    # 2. Cache Miss: Resolve coordinates
    logger.info(f"Redis Cache miss for dashboard query: '{city_query}'. Resolving coordinates...")
    selected_city = await resolve_city(city, db)
    
    # 3. Fetch weather forecast details from Open-Meteo
    weather_data = await weather_service.get_weather(
        lat=selected_city.latitude,
        lon=selected_city.longitude,
        city_name=selected_city.name,
        state=selected_city.state,
        country=selected_city.country
    )
    
    if not weather_data:
        raise HTTPException(
            status_code=500, 
            detail="Não foi possível recuperar os dados de clima da API meteorológica externa."
        )
        
    # 4. Save to history in PostgreSQL
    try:
        db_history = SearchHistory(
            city_name=weather_data.city_name,
            state=weather_data.state,
            country=weather_data.country,
            latitude=weather_data.latitude,
            longitude=weather_data.longitude,
            temperature=weather_data.current.temperature,
            apparent_temperature=weather_data.current.apparent_temperature,
            relative_humidity=weather_data.current.relative_humidity,
            surface_pressure=weather_data.current.surface_pressure,
            wind_speed=weather_data.current.wind_speed,
            precipitation=weather_data.current.precipitation,
            weather_code=weather_data.current.weather_code,
            risk_score=weather_data.risk.score,
            risk_level=weather_data.risk.nivel,
            summary=weather_data.summary,
            raw_data=weather_data.model_dump()
        )
        db.add(db_history)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"PostgreSQL history log failed: {e}")

    # 5. Save response to Redis cache for 5 minutes (300 seconds)
    cache_service.set(cache_key, weather_data.model_dump(), ttl=300)

    return weather_data


# --- ROTAS V2 (ANÁLISE HISTÓRICA E COMPARAÇÃO DE PERÍODOS) ---

@router.get("/weather/history", response_model=HistoricalQueryResponse)
async def get_weather_history(
    city: str = Query(..., min_length=2),
    start_date: str = Query(..., description="Data de início (YYYY-MM-DD)"),
    end_date: str = Query(..., description="Data final (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    Fetch historical weather records for a city name between a start and end date.
    Integrates Open-Meteo Archive API, calculates trends, and saves records.
    """
    from datetime import datetime, timedelta
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Formato de data inválido para a série histórica. Use YYYY-MM-DD (Ex: 2024-01-01)."
        )
        
    if start > end:
        raise HTTPException(
            status_code=400,
            detail="A data de início não pode ser posterior à data final na busca histórica."
        )
        
    max_allowed = datetime.now() - timedelta(days=5)
    if end > max_allowed:
        raise HTTPException(
            status_code=400,
            detail="A data final deve ser de pelo menos 5 dias atrás devido ao tempo de consolidação da API Archive."
        )

    city_normalized = city.lower().strip()
    cache_key = f"weather:history:{city_normalized}:{start_date}:{end_date}"
    
    # 1. Check Redis Cache
    cached_data = cache_service.get(cache_key)
    if cached_data:
        logger.info(f"Redis Cache hit for historical weather query: '{cache_key}'")
        return HistoricalQueryResponse(**cached_data)

    # 2. Cache Miss: Geocode City coordinates
    logger.info(f"Redis Cache miss for historical weather query: '{cache_key}'. Resolving coordinates...")
    selected_city = await resolve_city(city, db)

    # 3. Query historical weather series from Open-Meteo archive
    historical_data = await weather_service.get_historical_weather(
        lat=selected_city.latitude,
        lon=selected_city.longitude,
        city_name=selected_city.name,
        state=selected_city.state,
        country=selected_city.country,
        start_date=start_date,
        end_date=end_date
    )
    
    if not historical_data:
        raise HTTPException(
            status_code=500,
            detail="Não foi possível obter os dados históricos meteorológicos da API archive externa."
        )

    # 4. Persist Historical Query & Daily data to PostgreSQL
    try:
        db_query = HistoricalQuery(
            city_name=historical_data["city_name"],
            state=historical_data["state"],
            country=historical_data["country"],
            latitude=historical_data["latitude"],
            longitude=historical_data["longitude"],
            start_date=historical_data["start_date"],
            end_date=historical_data["end_date"],
            stats=historical_data["stats"],
            trend=historical_data["trend"],
            summary=historical_data["summary"]
        )
        db.add(db_query)
        db.commit()
        db.refresh(db_query)
        
        # Bulk-insert daily records
        daily_records = []
        for day in historical_data["daily_data"]:
            daily_records.append(
                HistoricalDailyData(
                    query_id=db_query.id,
                    date=day["date"],
                    max_temp=day["max_temp"],
                    min_temp=day["min_temp"],
                    mean_temp=day["mean_temp"],
                    rain=day["rain"],
                    wind_max=day["wind_max"]
                )
            )
        db.bulk_save_objects(daily_records)
        db.commit()
        
        # Update the object to include persisted list for serializer
        historical_data["id"] = db_query.id
        historical_data["searched_at"] = db_query.searched_at
    except Exception as e:
        db.rollback()
        logger.error(f"PostgreSQL historical persistence failed: {e}")
        # Attach temporary fallback mock attributes to serialization succeeds even on db log failures
        historical_data["id"] = 9999
        historical_data["searched_at"] = "2026-06-12T00:00:00"

    # 5. Cache response in Redis for 1 hour (3600 seconds)
    cache_service.set(cache_key, historical_data, ttl=3600)

    return historical_data


@router.get("/weather/compare", response_model=ComparisonResultResponse)
async def get_weather_compare(
    city: str = Query(..., min_length=2),
    start_a: str = Query(..., description="Início Período A (YYYY-MM-DD)"),
    end_a: str = Query(..., description="Final Período A (YYYY-MM-DD)"),
    start_b: str = Query(..., description="Início Período B (YYYY-MM-DD)"),
    end_b: str = Query(..., description="Final Período B (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    Compare climatic averages, rain, hot days, and average risks for a city
    between two different historical periods.
    """
    from datetime import datetime, timedelta
    try:
        sa = datetime.strptime(start_a, "%Y-%m-%d")
        ea = datetime.strptime(end_a, "%Y-%m-%d")
        sb = datetime.strptime(start_b, "%Y-%m-%d")
        eb = datetime.strptime(end_b, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Formato de data inválido na comparação de períodos. Use YYYY-MM-DD para todas as datas."
        )
        
    if sa > ea or sb > eb:
        raise HTTPException(
            status_code=400,
            detail="A data de início de um período não pode ser posterior à sua data final na comparação."
        )
        
    max_allowed = datetime.now() - timedelta(days=5)
    if ea > max_allowed or eb > max_allowed:
        raise HTTPException(
            status_code=400,
            detail="Ambos os períodos de comparação devem ter datas finais de pelo menos 5 dias no passado."
        )

    city_normalized = city.lower().strip()
    cache_key = f"weather:compare:{city_normalized}:{start_a}:{end_a}:{start_b}:{end_b}"
    
    # 1. Check Redis Cache
    cached_data = cache_service.get(cache_key)
    if cached_data:
        logger.info(f"Redis Cache hit for period comparison: '{cache_key}'")
        return ComparisonResultResponse(**cached_data)

    # 2. Cache Miss: Resolve coordinates
    logger.info(f"Redis Cache miss for period comparison: '{cache_key}'. Resolving coordinates...")
    selected_city = await resolve_city(city, db)

    # 3. Calculate period comparison
    comparison_data = await weather_service.compare_periods(
        lat=selected_city.latitude,
        lon=selected_city.longitude,
        city_name=selected_city.name,
        start_a=start_a,
        end_a=end_a,
        start_b=start_b,
        end_b=end_b
    )
    
    if not comparison_data:
        raise HTTPException(
            status_code=500,
            detail="Erro ao comparar os períodos selecionados através da API archive externa."
        )

    # 4. Save audit log to database
    try:
        db_comparison = ComparisonQuery(
            city_name=comparison_data["city_name"],
            start_a=start_a,
            end_a=end_a,
            start_b=start_b,
            end_b=end_b,
            result_data=comparison_data
        )
        db.add(db_comparison)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"PostgreSQL comparison persistence failed: {e}")

    # 5. Cache response in Redis for 1 hour (3600 seconds)
    cache_service.set(cache_key, comparison_data, ttl=3600)

    return comparison_data
