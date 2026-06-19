import httpx
import logging
from typing import List, Dict, Any, Optional
from app.weather_providers.base import BaseProvider

logger = logging.getLogger(__name__)

class OpenMeteoProvider(BaseProvider):
    def get_metadata(self) -> Dict[str, Any]:
        return {
            "id": "open_meteo",
            "name": "Open-Meteo",
            "description": "API global de previsão e reanálise meteorológica com cobertura mundial e alta resolução.",
            "source_type": "Modelo Numérico / Reanálise",
            "limitations": "Pode apresentar pequena divergência de microclimas locais por não utilizar medições diretas de solo em tempo real em todas as cidades brasileiras.",
            "data_coverage": "Global"
        }

    async def search_location(self, query: str) -> List[Dict[str, Any]]:
        if not query or len(query.strip()) < 2:
            return []
        
        url = "https://geocoding-api.open-meteo.com/v1/search"
        params = {
            "name": query.strip(),
            "count": 15,
            "language": "pt",
            "format": "json"
        }
        
        async with httpx.AsyncClient(timeout=6.0) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                results = data.get("results", [])
                
                br_cities = []
                for city in results:
                    country_code = city.get("country_code", "").upper()
                    if country_code == "BR":
                        br_cities.append({
                            "name": city.get("name"),
                            "latitude": float(city.get("latitude")),
                            "longitude": float(city.get("longitude")),
                            "state": city.get("admin1"),
                            "country": city.get("country", "Brasil")
                        })
                return br_cities
            except Exception as e:
                logger.error(f"Error in OpenMeteo geocoding search: {e}")
                return []

    async def get_current_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,precipitation,weather_code",
            "timezone": "auto"
        }
        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                current = data.get("current", {})
                return {
                    "temperature": current.get("temperature_2m", 0.0),
                    "apparent_temperature": current.get("apparent_temperature", 0.0),
                    "relative_humidity": current.get("relative_humidity_2m", 0.0),
                    "surface_pressure": current.get("surface_pressure", 1013.0),
                    "wind_speed": current.get("wind_speed_10m", 0.0),
                    "precipitation": current.get("precipitation", 0.0),
                    "weather_code": current.get("weather_code", 0),
                    "observation_time": current.get("time", "")
                }
            except Exception as e:
                logger.error(f"Error fetching current weather from Open-Meteo: {e}")
                raise

    async def get_forecast(self, lat: float, lon: float) -> Dict[str, Any]:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,precipitation,weather_code",
            "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code",
            "timezone": "auto"
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                current_data = data.get("current", {})
                hourly_data = data.get("hourly", {})
                daily_data = data.get("daily", {})
                
                return {
                    "current": {
                        "temperature": current_data.get("temperature_2m", 0.0),
                        "apparent_temperature": current_data.get("apparent_temperature", 0.0),
                        "relative_humidity": current_data.get("relative_humidity_2m", 0.0),
                        "surface_pressure": current_data.get("surface_pressure", 1013.0),
                        "wind_speed": current_data.get("wind_speed_10m", 0.0),
                        "precipitation": current_data.get("precipitation", 0.0),
                        "weather_code": current_data.get("weather_code", 0),
                        "observation_time": current_data.get("time", "")
                    },
                    "hourly": {
                        "time": hourly_data.get("time", [])[:24],
                        "temperature_2m": hourly_data.get("temperature_2m", [])[:24],
                        "relative_humidity_2m": hourly_data.get("relative_humidity_2m", [])[:24],
                        "precipitation_probability": hourly_data.get("precipitation_probability", [])[:24],
                        "weather_code": hourly_data.get("weather_code", [])[:24]
                    },
                    "daily": {
                        "time": daily_data.get("time", []),
                        "temperature_2m_max": daily_data.get("temperature_2m_max", []),
                        "temperature_2m_min": daily_data.get("temperature_2m_min", []),
                        "precipitation_sum": daily_data.get("precipitation_sum", []),
                        "wind_speed_10m_max": daily_data.get("wind_speed_10m_max", []),
                        "weather_code": daily_data.get("weather_code", [])
                    }
                }
            except Exception as e:
                logger.error(f"Error fetching forecast from Open-Meteo: {e}")
                raise

    async def get_historical_data(self, lat: float, lon: float, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        url = "https://archive-api.open-meteo.com/v1/archive"
        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": start_date,
            "end_date": end_date,
            "daily": "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max",
            "timezone": "auto"
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                daily_data = data.get("daily", {})
                times = daily_data.get("time", [])
                max_temps = daily_data.get("temperature_2m_max", [])
                min_temps = daily_data.get("temperature_2m_min", [])
                mean_temps = daily_data.get("temperature_2m_mean", [])
                rains = daily_data.get("precipitation_sum", [])
                winds = daily_data.get("wind_speed_10m_max", [])
                
                records = []
                for i in range(len(times)):
                    records.append({
                        "date": times[i],
                        "max_temp": max_temps[i] if max_temps[i] is not None else 0.0,
                        "min_temp": min_temps[i] if min_temps[i] is not None else 0.0,
                        "mean_temp": mean_temps[i] if mean_temps[i] is not None else 0.0,
                        "rain": rains[i] if rains[i] is not None else 0.0,
                        "wind_max": winds[i] if winds[i] is not None else 0.0
                    })
                return records
            except Exception as e:
                logger.error(f"Error fetching historical data from Open-Meteo: {e}")
                raise
