import random
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.weather_providers.base import BaseProvider

class MockProvider(BaseProvider):
    def get_metadata(self) -> Dict[str, Any]:
        return {
            "id": "mock",
            "name": "Mock Provider",
            "description": "Provedor simulado para testes e homologação local de interface.",
            "source_type": "Simulação",
            "limitations": "Não deve ser usado em ambientes de produção real, pois seus dados são pseudoaleatórios.",
            "data_coverage": "Nenhum (Dados Sintéticos)"
        }

    async def search_location(self, query: str) -> List[Dict[str, Any]]:
        return [
            {"name": "São Paulo Mock", "latitude": -23.5489, "longitude": -46.6388, "state": "SP", "country": "Brasil"},
            {"name": "Rio de Janeiro Mock", "latitude": -22.9068, "longitude": -43.1729, "state": "RJ", "country": "Brasil"}
        ]

    async def get_current_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        return {
            "temperature": 22.5,
            "apparent_temperature": 23.0,
            "relative_humidity": 65.0,
            "surface_pressure": 1012.0,
            "wind_speed": 12.0,
            "precipitation": 0.0,
            "weather_code": 1,
            "observation_time": datetime.now().isoformat()
        }

    async def get_forecast(self, lat: float, lon: float) -> Dict[str, Any]:
        times = [(datetime.now() + timedelta(hours=i)).isoformat() for i in range(24)]
        daily_times = [(datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
        
        return {
            "current": await self.get_current_weather(lat, lon),
            "hourly": {
                "time": times,
                "temperature_2m": [20.0 + random.uniform(-3, 3) for _ in range(24)],
                "relative_humidity_2m": [60.0 + random.uniform(-10, 10) for _ in range(24)],
                "precipitation_probability": [random.uniform(0, 100) for _ in range(24)],
                "weather_code": [1 for _ in range(24)]
            },
            "daily": {
                "time": daily_times,
                "temperature_2m_max": [25.0 + random.uniform(-3, 3) for _ in range(7)],
                "temperature_2m_min": [15.0 + random.uniform(-3, 3) for _ in range(7)],
                "precipitation_sum": [random.uniform(0, 20) for _ in range(7)],
                "wind_speed_10m_max": [15.0 + random.uniform(-5, 5) for _ in range(7)],
                "weather_code": [2 for _ in range(7)]
            }
        }

    async def get_historical_data(self, lat: float, lon: float, start_date: str, end_date: str, db: Optional[Any] = None) -> List[Dict[str, Any]]:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        days = (end - start).days + 1
        
        records = []
        for i in range(days):
            current_day = start + timedelta(days=i)
            # Gera dados simulados coerentes com o clima brasileiro médio
            max_t = 24.0 + random.uniform(-4, 4)
            min_t = 14.0 + random.uniform(-4, 4)
            mean_t = (max_t + min_t) / 2
            rain = 0.0 if random.random() > 0.3 else random.uniform(1.0, 30.0)
            wind = random.uniform(5.0, 25.0)
            
            records.append({
                "date": current_day.strftime("%Y-%m-%d"),
                "max_temp": round(max_t, 2),
                "min_temp": round(min_t, 2),
                "mean_temp": round(mean_t, 2),
                "rain": round(rain, 2),
                "wind_max": round(wind, 2)
            })
        return records
