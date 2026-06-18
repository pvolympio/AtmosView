import httpx
import logging
from typing import List, Optional, Dict, Any
from app.schemas import (
    CitySearchResult, WeatherResponse, CurrentWeather, HourlyForecast, DailyForecast,
    HistoricalQueryResponse, HistoricalStats, TrendAnalysis, HistoricalDailyDataResponse,
    ComparisonResultResponse
)
from app.services.risk_service import risk_service
from app.services.report_service import report_service
from app.services.historical_report_service import historical_report_service

logger = logging.getLogger(__name__)

class WeatherService:
    async def search_cities(self, query: str) -> List[CitySearchResult]:
        if not query or len(query.strip()) < 2:
            return []
        
        from app.services.cache import cache_service
        query_clean = query.strip().lower()
        cache_key = f"geocoding:search:{query_clean}"
        
        # Check cache first
        cached_data = cache_service.get(cache_key)
        if cached_data:
            logger.info(f"Redis Cache hit for geocoding: '{query_clean}'")
            return [CitySearchResult(**c) for c in cached_data]
        
        # Geocoding API from Open-Meteo
        url = "https://geocoding-api.open-meteo.com/v1/search"
        params = {
            "name": query.strip(),
            "count": 15,
            "language": "pt",
            "format": "json"
        }
        
        async with httpx.AsyncClient(timeout=4.0) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                results = data.get("results", [])
                
                br_cities = []
                for city in results:
                    country_code = city.get("country_code", "").upper()
                    if country_code == "BR":
                        br_cities.append(CitySearchResult(
                            name=city.get("name"),
                            latitude=city.get("latitude"),
                            longitude=city.get("longitude"),
                            state=city.get("admin1"),
                            country=city.get("country", "Brasil")
                        ))
                
                # Cache results for 24 hours (86400 seconds)
                if br_cities:
                    cache_service.set(cache_key, [c.model_dump() for c in br_cities], ttl=86400)
                    
                return br_cities
            except Exception as e:
                logger.error(f"Error searching cities in Geocoding: {e}")
                return []

    async def get_weather(self, lat: float, lon: float, city_name: str, state: Optional[str] = None, country: str = "Brasil") -> Optional[WeatherResponse]:
        # Fetch current, hourly, and daily forecast
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
                
                current = CurrentWeather(
                    temperature=current_data.get("temperature_2m", 0.0),
                    apparent_temperature=current_data.get("apparent_temperature", 0.0),
                    relative_humidity=current_data.get("relative_humidity_2m", 0.0),
                    surface_pressure=current_data.get("surface_pressure", 1013.0),
                    wind_speed=current_data.get("wind_speed_10m", 0.0),
                    precipitation=current_data.get("precipitation", 0.0),
                    weather_code=current_data.get("weather_code", 0),
                    observation_time=current_data.get("time", "")
                )
                
                risk = risk_service.calculate_risk(
                    temperature=current.temperature,
                    humidity=current.relative_humidity,
                    wind_speed=current.wind_speed,
                    precipitation=current.precipitation,
                    pressure=current.surface_pressure
                )
                
                summary = report_service.generate_summary(
                    city_name=city_name,
                    temperature=current.temperature,
                    apparent_temperature=current.apparent_temperature,
                    humidity=current.relative_humidity,
                    wind_speed=current.wind_speed,
                    risk_level=risk.nivel
                )
                
                hourly = HourlyForecast(
                    time=hourly_data.get("time", [])[:24],
                    temperature_2m=hourly_data.get("temperature_2m", [])[:24],
                    relative_humidity_2m=hourly_data.get("relative_humidity_2m", [])[:24],
                    precipitation_probability=hourly_data.get("precipitation_probability", [])[:24],
                    weather_code=hourly_data.get("weather_code", [])[:24]
                )
                
                daily = DailyForecast(
                    time=daily_data.get("time", []),
                    temperature_2m_max=daily_data.get("temperature_2m_max", []),
                    temperature_2m_min=daily_data.get("temperature_2m_min", []),
                    precipitation_sum=daily_data.get("precipitation_sum", []),
                    wind_speed_10m_max=daily_data.get("wind_speed_10m_max", []),
                    weather_code=daily_data.get("weather_code", [])
                )
                
                return WeatherResponse(
                    city_name=city_name,
                    state=state,
                    country=country,
                    latitude=lat,
                    longitude=lon,
                    current=current,
                    risk=risk,
                    summary=summary,
                    hourly=hourly,
                    daily=daily
                )
            except Exception as e:
                logger.error(f"Error fetching weather from Open-Meteo: {e}")
                return None

    # V2: Fetch historical series from Open-Meteo Archive API
    async def get_historical_weather(
        self,
        lat: float,
        lon: float,
        city_name: str,
        state: Optional[str],
        country: str,
        start_date: str,
        end_date: str
    ) -> Optional[Dict[str, Any]]:
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
                
                if not times:
                    return None

                # Safely fill None values in dataset with zeros or averages
                max_temps = [t if t is not None else 20.0 for t in max_temps]
                min_temps = [t if t is not None else 15.0 for t in min_temps]
                mean_temps = [t if t is not None else 18.0 for t in mean_temps]
                rains = [r if r is not None else 0.0 for r in rains]
                winds = [w if w is not None else 10.0 for w in winds]

                # Compute statistics
                stats = historical_report_service.calculate_stats(times, max_temps, min_temps, mean_temps, rains)
                
                # Compute linear trend slope
                trend = historical_report_service.calculate_trend(mean_temps)
                
                # Generate narrative summary
                summary = historical_report_service.generate_summary(city_name, start_date, end_date, stats, trend)

                # Build daily data responses list
                daily_list = []
                for i in range(len(times)):
                    daily_list.append({
                        "date": times[i],
                        "max_temp": max_temps[i],
                        "min_temp": min_temps[i],
                        "mean_temp": mean_temps[i],
                        "rain": rains[i],
                        "wind_max": winds[i]
                    })

                return {
                    "city_name": city_name,
                    "state": state,
                    "country": country,
                    "latitude": lat,
                    "longitude": lon,
                    "start_date": start_date,
                    "end_date": end_date,
                    "stats": stats,
                    "trend": trend,
                    "summary": summary,
                    "daily_data": daily_list
                }
            except Exception as e:
                logger.error(f"Error calling Open-Meteo Archive: {e}")
                return None

    # V2: Compare two periods
    def calculate_simplified_daily_risk(self, max_temp: float, rain: float, wind: float) -> float:
        """Calculates a simplified daily risk index (0 to 10) for comparison purposes"""
        score = 0.0
        if max_temp > 35.0:
            score += 3.0
        elif max_temp > 32.0:
            score += 1.5
            
        if rain > 25.0:
            score += 3.0
        elif rain > 8.0:
            score += 1.5
            
        if wind > 50.0:
            score += 3.0
        elif wind > 30.0:
            score += 1.5
            
        return min(score, 10.0)

    async def compare_periods(
        self,
        lat: float,
        lon: float,
        city_name: str,
        start_a: str,
        end_a: str,
        start_b: str,
        end_b: str
    ) -> Optional[Dict[str, Any]]:
        # Fetch Period A
        data_a = await self.get_historical_weather(lat, lon, city_name, None, "Brasil", start_a, end_a)
        # Fetch Period B
        data_b = await self.get_historical_weather(lat, lon, city_name, None, "Brasil", start_b, end_b)
        
        if not data_a or not data_b:
            return None
            
        stats_a = data_a["stats"]
        stats_b = data_b["stats"]

        # Calculate average simplified risk for each period
        daily_a = data_a["daily_data"]
        daily_b = data_b["daily_data"]
        
        risk_a_sum = sum(self.calculate_simplified_daily_risk(d["max_temp"], d["rain"], d["wind_max"]) for d in daily_a)
        risk_b_sum = sum(self.calculate_simplified_daily_risk(d["max_temp"], d["rain"], d["wind_max"]) for d in daily_b)
        
        avg_risk_a = risk_a_sum / len(daily_a) if daily_a else 0.0
        avg_risk_b = risk_b_sum / len(daily_b) if daily_b else 0.0

        # Differences
        temp_diff = stats_b["avg_temp"] - stats_a["avg_temp"]
        rain_diff = stats_b["total_rain"] - stats_a["total_rain"]
        
        # Avoid division by zero for percentage rain diff
        if stats_a["total_rain"] > 0:
            rain_diff_percent = (rain_diff / stats_a["total_rain"]) * 100
        else:
            rain_diff_percent = 0.0

        return {
            "city_name": city_name,
            "start_a": start_a,
            "end_a": end_a,
            "start_b": start_b,
            "end_b": end_b,
            
            "period_a_avg_temp": stats_a["avg_temp"],
            "period_b_avg_temp": stats_b["avg_temp"],
            "temp_diff": round(temp_diff, 1),
            
            "period_a_total_rain": stats_a["total_rain"],
            "period_b_total_rain": stats_b["total_rain"],
            "rain_diff": round(rain_diff, 1),
            "rain_diff_percent": round(rain_diff_percent, 1),
            
            "period_a_hot_days": stats_a["days_hot"],
            "period_b_hot_days": stats_b["days_hot"],
            
            "period_a_rainy_days": stats_a["days_relevant_rain"],
            "period_b_rainy_days": stats_b["days_relevant_rain"],
            
            "period_a_avg_risk": round(avg_risk_a, 1),
            "period_b_avg_risk": round(avg_risk_b, 1)
        }

weather_service = WeatherService()
