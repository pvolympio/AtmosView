import os
import joblib
import httpx
import logging
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models import MLModel, MLPrediction
from app.services.risk_service import risk_service

logger = logging.getLogger(__name__)

class InferenceService:
    def _generate_slug(self, name: str) -> str:
        return "".join([c if c.isalnum() else "_" for c in name.lower()])

    def get_season_code(self, month: int) -> int:
        if month in [12, 1, 2]:
            return 0
        elif month in [3, 4, 5]:
            return 1
        elif month in [6, 7, 8]:
            return 2
        else:
            return 3

    async def fetch_recent_context(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """
        Fetches the last 7 days of daily metrics from the forecast API (with past_days=7)
        to compile features for today.
        """
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "past_days": 7,
            "daily": "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max",
            "timezone": "auto"
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                daily = data.get("daily", {})
                times = daily.get("time", [])
                
                if len(times) < 8:
                    logger.warning(f"Insufficient daily history context received: {len(times)} days.")
                    return None
                    
                # We need features for 'today', which is the last index (index -1 or index 7)
                # and historical lags (indices 0 to 6)
                max_temps = [t if t is not None else 20.0 for t in daily.get("temperature_2m_max", [])]
                min_temps = [t if t is not None else 15.0 for t in daily.get("temperature_2m_min", [])]
                mean_temps = [t if t is not None else 18.0 for t in daily.get("temperature_2m_mean", [])]
                rains = [r if r is not None else 0.0 for r in daily.get("precipitation_sum", [])]
                winds = [w if w is not None else 10.0 for w in daily.get("wind_speed_10m_max", [])]
                
                # Today values (index -1)
                today_idx = -1
                
                # Compute rolling and shifts
                rain_prev_day = rains[-2]
                rain_rolling_3 = sum(rains[-3:]) / 3.0
                rain_rolling_7 = sum(rains[-7:]) / 7.0
                temp_rolling_7 = sum(mean_temps[-7:]) / 7.0
                
                today_month = datetime.now().month
                today_season = self.get_season_code(today_month)
                
                # Construct features dictionary matching X.columns of training
                features = {
                    "max_temp": max_temps[today_idx],
                    "min_temp": min_temps[today_idx],
                    "mean_temp": mean_temps[today_idx],
                    "rain": rains[today_idx],
                    "wind_max": winds[today_idx],
                    "rain_prev_day": rain_prev_day,
                    "rain_rolling_3": rain_rolling_3,
                    "rain_rolling_7": rain_rolling_7,
                    "temp_rolling_7": temp_rolling_7,
                    "month": today_month,
                    "season": today_season,
                    "latitude": lat,
                    "longitude": lon
                }
                
                return features
            except Exception as e:
                logger.error(f"Error fetching context for prediction: {e}")
                return None

    def run_rule_fallback(
        self,
        current_temp: float,
        current_humidity: float,
        current_wind: float,
        current_precip: float,
        current_pressure: float
    ) -> List[Dict[str, Any]]:
        """
        Fallback heuristics when no models are trained yet.
        """
        # 1. Rain
        will_rain = current_humidity > 75.0 or current_precip > 0.0
        rain_prob = 0.75 if will_rain else 0.15
        
        # 2. Heavy Rain
        heavy_rain = current_precip > 8.0 or (current_precip > 3.0 and current_wind > 35.0)
        heavy_prob = 0.65 if heavy_rain else 0.05
        
        # 3. Risk Level
        risk_assessment = risk_service.calculate_risk(
            temperature=current_temp,
            humidity=current_humidity,
            wind_speed=current_wind,
            precipitation=current_precip,
            pressure=current_pressure
        )
        
        # Mapping score to mock probability/confidence
        confidence = min(max(risk_assessment.score / 10.0, 0.5), 0.95)
        
        return [
            {
                "prediction_type": "rain",
                "label": "Sim" if will_rain else "Não",
                "probability": rain_prob,
                "source": "rule-based"
            },
            {
                "prediction_type": "heavy_rain",
                "label": "Sim" if heavy_rain else "Não",
                "probability": heavy_prob,
                "source": "rule-based"
            },
            {
                "prediction_type": "risk",
                "label": risk_assessment.nivel,
                "probability": confidence,
                "source": "rule-based"
            }
        ]

    async def predict(
        self,
        db: Session,
        city_name: str,
        lat: float,
        lon: float,
        current_temp: float,
        current_humidity: float,
        current_wind: float,
        current_precip: float,
        current_pressure: float
    ) -> Dict[str, Any]:
        """
        Main predict endpoint driver. Checks database models, fetches recent
        meteorological history context, makes inference, and records predictions.
        """
        # 1. Check if we have models for this city
        models = db.query(MLModel).filter(MLModel.city_name == city_name).all()
        has_trained_models = len(models) >= 3
        
        last_trained_at = None
        if has_trained_models:
            last_trained_at = max(m.trained_at for m in models)
            
        predictions = []
        
        if has_trained_models:
            logger.info(f"Loading trained models for {city_name} to execute prediction...")
            
            # Fetch rolling context features
            features = await self.fetch_recent_context(lat, lon)
            if not features:
                logger.warning("Could not fetch recent history context. Falling back to rule-based prediction.")
                predictions = self.run_rule_fallback(
                    current_temp, current_humidity, current_wind, current_precip, current_pressure
                )
            else:
                # Convert features dict to a single-row DataFrame with explicit column order
                feature_cols = [
                    "max_temp", "min_temp", "mean_temp", "rain", "wind_max",
                    "rain_prev_day", "rain_rolling_3", "rain_rolling_7", "temp_rolling_7",
                    "month", "season", "latitude", "longitude"
                ]
                X_pred = pd.DataFrame([features])[feature_cols]
                
                try:
                    # Execute prediction for each model
                    for db_model in models:
                        model_path = db_model.file_path
                        if not os.path.exists(model_path):
                            raise FileNotFoundError(f"Model binary not found at path: {model_path}")
                            
                        model = joblib.load(model_path)
                        pred_class = model.predict(X_pred)[0]
                        proba = model.predict_proba(X_pred)[0]
                        
                        # Labels formatting
                        if db_model.model_type in ["rain", "heavy_rain"]:
                            label = "Sim" if int(pred_class) == 1 else "Não"
                            confidence = float(proba[1] if int(pred_class) == 1 else proba[0])
                        else:
                            # Risk model mapping (0=Baixo, 1=Moderado, 2=Alto, 3=Crítico)
                            risk_labels = {0: "Baixo", 1: "Moderado", 2: "Alto", 3: "Crítico"}
                            label = risk_labels.get(int(pred_class), "Baixo")
                            confidence = float(proba[int(pred_class)])
                            
                        predictions.append({
                            "prediction_type": db_model.model_type,
                            "label": label,
                            "probability": round(confidence, 2),
                            "source": "ml-model"
                        })
                except Exception as ex:
                    logger.error(f"Inference execution failed: {ex}. Falling back to rule-based prediction.")
                    predictions = self.run_rule_fallback(
                        current_temp, current_humidity, current_wind, current_precip, current_pressure
                    )
        else:
            logger.info(f"No trained models found for {city_name}. Executing rule-based fallback predictions.")
            predictions = self.run_rule_fallback(
                current_temp, current_humidity, current_wind, current_precip, current_pressure
            )
            
        # Save predictions to Postgres database
        try:
            for pred in predictions:
                db_pred = MLPrediction(
                    city_name=city_name,
                    prediction_type=pred["prediction_type"],
                    prediction_value=str(pred["label"]),
                    confidence=pred["probability"],
                    source=pred["source"]
                )
                db.add(db_pred)
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to save ML predictions to database: {e}")
            
        return {
            "city_name": city_name,
            "predictions": predictions,
            "model_trained": has_trained_models,
            "last_trained_at": last_trained_at
        }

inference_service = InferenceService()
