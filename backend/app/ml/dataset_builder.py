import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from typing import Tuple, Dict, Any, Optional
from app.services.weather import weather_service

logger = logging.getLogger(__name__)

class DatasetBuilder:
    def get_date_range(self, period_years: int = 2) -> Tuple[str, str]:
        """
        Gets start and end dates. End date is 5 days ago due to Open-Meteo Archive constraint.
        Start date is period_years ago.
        """
        today = datetime.now()
        end = today - timedelta(days=5)
        start = end - timedelta(days=365 * period_years)
        
        return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")

    def get_season_code(self, month: int) -> int:
        """
        Southern Hemisphere seasons:
        12, 1, 2 -> Verão (0)
        3, 4, 5 -> Outono (1)
        6, 7, 8 -> Inverno (2)
        9, 10, 11 -> Primavera (3)
        """
        if month in [12, 1, 2]:
            return 0
        elif month in [3, 4, 5]:
            return 1
        elif month in [6, 7, 8]:
            return 2
        else:
            return 3

    def calculate_risk_level_code(self, max_temp: float, rain: float, wind_max: float) -> int:
        """
        Calculates a simplified daily risk code (0=Baixo, 1=Moderado, 2=Alto, 3=Crítico)
        based on the ICR rules.
        """
        score = 0.0
        if max_temp > 35.0:
            score += 3.0
        elif max_temp > 32.0:
            score += 1.5
            
        if rain > 25.0:
            score += 3.0
        elif rain > 8.0:
            score += 1.5
            
        if wind_max > 50.0:
            score += 3.0
        elif wind_max > 30.0:
            score += 1.5
            
        score = min(score, 10.0)
        
        if score <= 2.0:
            return 0  # Baixo
        elif score <= 5.0:
            return 1  # Moderado
        elif score <= 8.0:
            return 2  # Alto
        else:
            return 3  # Crítico

    async def build_dataset(
        self,
        lat: float,
        lon: float,
        city_name: str,
        period_years: int = 2
    ) -> Optional[Tuple[pd.DataFrame, pd.Series, pd.Series, pd.Series]]:
        """
        Builds the pandas DataFrame and target series for training.
        """
        start_date, end_date = self.get_date_range(period_years)
        logger.info(f"Building ML dataset for '{city_name}' ({lat}, {lon}) from {start_date} to {end_date}")
        
        # 1. Fetch historical weather
        historical_res = await weather_service.get_historical_weather(
            lat=lat,
            lon=lon,
            city_name=city_name,
            state=None,
            country="Brasil",
            start_date=start_date,
            end_date=end_date
        )
        
        if not historical_res or not historical_res.get("daily_data"):
            logger.error("No daily data received for building dataset")
            return None
            
        daily_list = historical_res["daily_data"]
        df = pd.DataFrame(daily_list)
        
        # Ensure we have correct types
        df["max_temp"] = df["max_temp"].astype(float)
        df["min_temp"] = df["min_temp"].astype(float)
        df["mean_temp"] = df["mean_temp"].astype(float)
        df["rain"] = df["rain"].astype(float)
        df["wind_max"] = df["wind_max"].astype(float)
        
        # 2. Add time features
        df["date_parsed"] = pd.to_datetime(df["date"])
        df["month"] = df["date_parsed"].dt.month
        df["season"] = df["month"].apply(self.get_season_code)
        
        # 3. Add rolling and lag features
        df["rain_prev_day"] = df["rain"].shift(1)
        df["rain_rolling_3"] = df["rain"].rolling(window=3).mean()
        df["rain_rolling_7"] = df["rain"].rolling(window=7).mean()
        df["temp_rolling_7"] = df["mean_temp"].rolling(window=7).mean()
        
        # Add geographic coordinates as constant features
        df["latitude"] = lat
        df["longitude"] = lon
        
        # 4. Define Targets for next day (shift -1)
        df["tomorrow_rain"] = df["rain"].shift(-1)
        df["tomorrow_max_temp"] = df["max_temp"].shift(-1)
        df["tomorrow_wind_max"] = df["wind_max"].shift(-1)
        
        # Target 1: Will rain tomorrow (>= 1.0 mm)
        df["target_will_rain"] = (df["tomorrow_rain"] >= 1.0).astype(int)
        
        # Target 2: Heavy rain tomorrow (>= 10.0 mm)
        df["target_heavy_rain"] = (df["tomorrow_rain"] >= 10.0).astype(int)
        
        # Target 3: Risk level tomorrow
        df["target_risk_level"] = df.apply(
            lambda r: self.calculate_risk_level_code(
                r["tomorrow_max_temp"], r["tomorrow_rain"], r["tomorrow_wind_max"]
            ) if not pd.isna(r["tomorrow_rain"]) else 0,
            axis=1
        )
        
        # Drop rows with NaN values (resulting from rolling and shifts)
        df_clean = df.dropna().copy()
        
        if len(df_clean) < 30:
            logger.error(f"Not enough data rows after cleaning: {len(df_clean)} rows.")
            return None
            
        logger.info(f"Dataset compiled. Cleaned sample size: {len(df_clean)} rows")
        
        # Define feature columns
        feature_cols = [
            "max_temp", "min_temp", "mean_temp", "rain", "wind_max",
            "rain_prev_day", "rain_rolling_3", "rain_rolling_7", "temp_rolling_7",
            "month", "season", "latitude", "longitude"
        ]
        
        X = df_clean[feature_cols]
        y_rain = df_clean["target_will_rain"]
        y_heavy = df_clean["target_heavy_rain"]
        y_risk = df_clean["target_risk_level"]
        
        return X, y_rain, y_heavy, y_risk

dataset_builder = DatasetBuilder()
