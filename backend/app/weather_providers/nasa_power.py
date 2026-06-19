import httpx
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.weather_providers.base import BaseProvider

logger = logging.getLogger(__name__)

class NasaPowerProvider(BaseProvider):
    def get_metadata(self) -> Dict[str, Any]:
        return {
            "id": "nasa_power",
            "name": "NASA POWER",
            "description": "Banco de dados meteorológicos globais de satélites e modelos climáticos da NASA.",
            "source_type": "Satélite / Reanálise",
            "limitations": "Os dados de satélite possuem resolução espacial de ~50km, o que pode suavizar extremos climáticos locais.",
            "data_coverage": "Global"
        }

    async def search_location(self, query: str) -> List[Dict[str, Any]]:
        # NASA POWER doesn't have a geocoding API.
        return []

    async def get_current_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        # NASA POWER does not support real-time queries.
        return {}

    async def get_forecast(self, lat: float, lon: float) -> Dict[str, Any]:
        # NASA POWER does not support forecasting.
        return {}

    async def get_historical_data(self, lat: float, lon: float, start_date: str, end_date: str, db: Optional[Any] = None) -> List[Dict[str, Any]]:
        # Formata datas de YYYY-MM-DD para YYYYMMDD
        start_formatted = start_date.replace("-", "")
        end_formatted = end_date.replace("-", "")
        
        url = "https://power.larc.nasa.gov/api/temporal/daily/point"
        params = {
            "parameters": "T2M_MAX,T2M_MIN,T2M,PRECTOTCORR,WS10M_MAX",
            "community": "AG",
            "longitude": lon,
            "latitude": lat,
            "start": start_formatted,
            "end": end_formatted,
            "format": "JSON"
        }
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                properties = data.get("properties", {})
                parameter = properties.get("parameter", {})
                
                t2m_max = parameter.get("T2M_MAX", {})
                t2m_min = parameter.get("T2M_MIN", {})
                t2m_mean = parameter.get("T2M", {})
                precip = parameter.get("PRECTOTCORR", {})
                wind = parameter.get("WS10M_MAX", {})
                
                records = []
                # Use as chaves de data retornadas
                for date_key in sorted(t2m_mean.keys()):
                    # Converte "YYYYMMDD" para "YYYY-MM-DD"
                    formatted_date = f"{date_key[:4]}-{date_key[4:6]}-{date_key[6:]}"
                    
                    # NASA POWER usa -999.0 ou valores < -900 para dados ausentes
                    max_t = t2m_max.get(date_key, 0.0)
                    min_t = t2m_min.get(date_key, 0.0)
                    mean_t = t2m_mean.get(date_key, 0.0)
                    rain_val = precip.get(date_key, 0.0)
                    wind_val = wind.get(date_key, 0.0)
                    
                    # Trata dados ausentes (-999.0)
                    max_t = max_t if max_t > -900 else 0.0
                    min_t = min_t if min_t > -900 else 0.0
                    mean_t = mean_t if mean_t > -900 else 0.0
                    rain_val = rain_val if rain_val > -900 else 0.0
                    wind_val = wind_val if wind_val > -900 else 0.0
                    
                    # Converte vento de m/s para km/h (NASA POWER vento diário máximo é m/s)
                    wind_kmh = round(wind_val * 3.6, 2)
                    
                    records.append({
                        "date": formatted_date,
                        "max_temp": round(max_t, 2),
                        "min_temp": round(min_t, 2),
                        "mean_temp": round(mean_t, 2),
                        "rain": round(rain_val, 2),
                        "wind_max": wind_kmh
                    })
                return records
            except Exception as e:
                logger.error(f"Error fetching historical data from NASA POWER: {e}")
                raise
