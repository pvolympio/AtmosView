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
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class WeatherService:
    async def resolve_city(self, city_query: str, db: Session) -> CitySearchResult:
        """Helper to geocode a Brazilian city, using local database caching first"""
        city_normalized = city_query.lower().strip()
        search_parts = city_normalized.split(",")
        search_query = search_parts[0].strip()
        state_query = search_parts[1].strip() if len(search_parts) > 1 else None
        
        from app.models import SearchHistory, HistoricalQuery
        
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
            
        # Fall back to Geocoding Search API
        cities = await self.search_cities(search_query)
        if not cities:
            from fastapi import HTTPException
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

    async def seed_stations(self, db: Any) -> int:
        from app.models import WeatherStation
        
        # Verifica se já foi populado
        if db.query(WeatherStation).count() > 0:
            logger.info("Estações meteorológicas do INMET já cadastradas no banco de dados.")
            return 0
            
        logger.info("Iniciando carga de estações meteorológicas do INMET...")
        url = "https://apitempo.inmet.gov.br/estacoes/T"
        
        # Lista de capitais como fallback caso a API falhe ou demore
        capitals_fallback = [
            {"CD_ESTACAO": "A701", "DC_NOME": "SÃO PAULO - MIRANTE", "SG_ESTADO": "SP", "VL_LATITUDE": "-23.496294", "VL_LONGITUDE": "-46.620088", "VL_ALTITUDE": "792.06"},
            {"CD_ESTACAO": "A602", "DC_NOME": "RIO DE JANEIRO - COPACABANA", "SG_ESTADO": "RJ", "VL_LATITUDE": "-22.988333", "VL_LONGITUDE": "-43.190556", "VL_ALTITUDE": "25.0"},
            {"CD_ESTACAO": "A301", "DC_NOME": "RECIFE - CURADO", "SG_ESTADO": "PE", "VL_LATITUDE": "-8.058333", "VL_LONGITUDE": "-34.959167", "VL_ALTITUDE": "7.0"},
            {"CD_ESTACAO": "A801", "DC_NOME": "PORTO ALEGRE", "SG_ESTADO": "RS", "VL_LATITUDE": "-30.05", "VL_LONGITUDE": "-51.166667", "VL_ALTITUDE": "46.86"},
            {"CD_ESTACAO": "A001", "DC_NOME": "BRASILIA", "SG_ESTADO": "DF", "VL_LATITUDE": "-15.789444", "VL_LONGITUDE": "-47.925833", "VL_ALTITUDE": "1159.54"},
            {"CD_ESTACAO": "A201", "DC_NOME": "FORTALEZA", "SG_ESTADO": "CE", "VL_LATITUDE": "-3.7225", "VL_LONGITUDE": "-38.543333", "VL_ALTITUDE": "26.0"},
            {"CD_ESTACAO": "A502", "DC_NOME": "BELO HORIZONTE - PAMPULHA", "SG_ESTADO": "MG", "VL_LATITUDE": "-19.883889", "VL_LONGITUDE": "-43.968611", "VL_ALTITUDE": "854.87"},
            {"CD_ESTACAO": "A307", "DC_NOME": "SALVADOR", "SG_ESTADO": "BA", "VL_LATITUDE": "-13.005", "VL_LONGITUDE": "-38.504722", "VL_ALTITUDE": "51.41"},
            {"CD_ESTACAO": "A901", "DC_NOME": "MANAUS", "SG_ESTADO": "AM", "VL_LATITUDE": "-3.103333", "VL_LONGITUDE": "-60.016389", "VL_ALTITUDE": "72.0"}
        ]
        
        stations_data = []
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                stations_data = response.json()
                logger.info(f"Carregadas {len(stations_data)} estações do INMET via API.")
            except Exception as e:
                logger.warning(f"Falha na API de estações do INMET ({e}). Usando capitais de fallback.")
                stations_data = capitals_fallback
                
        inserted_count = 0
        db_stations = []
        
        for item in stations_data:
            station_id = item.get("CD_ESTACAO")
            name = item.get("DC_NOME")
            state = item.get("SG_ESTADO")
            lat_raw = item.get("VL_LATITUDE")
            lon_raw = item.get("VL_LONGITUDE")
            alt_raw = item.get("VL_ALTITUDE")
            
            if not station_id or not name or not state or lat_raw is None or lon_raw is None:
                continue
                
            try:
                lat = float(str(lat_raw).replace(",", "."))
                lon = float(str(lon_raw).replace(",", "."))
                alt = float(str(alt_raw).replace(",", ".")) if alt_raw is not None else None
            except ValueError:
                continue
                
            # Evita duplicidade
            exists = db.query(WeatherStation).filter(WeatherStation.id == station_id).first()
            if exists:
                continue
                
            db_stations.append(WeatherStation(
                id=station_id,
                name=name,
                state=state,
                latitude=lat,
                longitude=lon,
                altitude=alt,
                source="inmet",
                status="Operante"
            ))
            inserted_count += 1
            
        if db_stations:
            db.bulk_save_objects(db_stations)
            db.commit()
            logger.info(f"Carga de estações finalizada. {inserted_count} estações salvas no banco de dados.")
        else:
            logger.info("Nenhuma estação nova inserida.")
            
        return inserted_count

    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        import math
        R = 6371.0  # Raio da Terra em km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)

    def get_nearest_station(self, db: Any, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        from app.models import WeatherStation
        stations = db.query(WeatherStation).all()
        if not stations:
            return None
            
        nearest_station = None
        min_distance = float('inf')
        
        for station in stations:
            dist = self.calculate_distance(lat, lon, station.latitude, station.longitude)
            if dist < min_distance:
                min_distance = dist
                nearest_station = station
                
        if nearest_station:
            return {
                "id": nearest_station.id,
                "name": nearest_station.name,
                "state": nearest_station.state,
                "latitude": nearest_station.latitude,
                "longitude": nearest_station.longitude,
                "altitude": nearest_station.altitude,
                "source": nearest_station.source,
                "status": nearest_station.status,
                "distance": min_distance
            }
        return None

    async def compare_sources(self, db: Any, city_name: str, lat: float, lon: float, start_date: str, end_date: str) -> Dict[str, Any]:
        from app.weather_providers import get_provider
        from app.services.data_quality_service import data_quality_service
        from app.models import SourceComparison, DataQualityReport
        
        # 1. Encontra a estação INMET física mais próxima
        nearest_station = self.get_nearest_station(db, lat, lon)
        
        active_providers = ["open_meteo", "nasa_power"]
        if nearest_station:
            active_providers.append("inmet")
            
        sources_data = {}
        
        # 2. Reúne dados diários e avalia qualidade para cada fonte
        for provider_id in active_providers:
            provider = get_provider(provider_id)
            metadata = provider.get_metadata()
            
            try:
                # InmetProvider usa as coordenadas e resolve a mais próxima internamente (que bate com a resolvida aqui)
                daily_records = await provider.get_historical_data(lat, lon, start_date, end_date)
            except Exception as e:
                logger.error(f"Erro ao obter dados do provedor {provider_id}: {e}")
                daily_records = []
                
            # Avaliação de qualidade
            quality_report = data_quality_service.evaluate_dataset(
                records=daily_records,
                start_date=start_date,
                end_date=end_date,
                source_name=metadata["name"]
            )
            
            # Grava relatório de qualidade
            try:
                db_report = DataQualityReport(
                    city_name=city_name,
                    source=provider_id,
                    start_date=start_date,
                    end_date=end_date,
                    missing_data_count=quality_report["missing_data_count"],
                    extreme_values_count=quality_report["extreme_values_count"],
                    temporal_gaps=quality_report["temporal_gaps"],
                    completeness_percentage=quality_report["completeness_percentage"],
                    quality_grade=quality_report["quality_grade"],
                    report_data=quality_report["report_data"]
                )
                db.add(db_report)
                db.commit()
            except Exception as ex:
                db.rollback()
                logger.error(f"Erro ao salvar relatório de qualidade no banco para {provider_id}: {ex}")
                
            # Estatísticas rápidas
            avg_temp = 0.0
            total_rain = 0.0
            max_wind = 0.0
            valid_temps = [r["mean_temp"] for r in daily_records if r.get("mean_temp") is not None]
            valid_rains = [r["rain"] for r in daily_records if r.get("rain") is not None]
            valid_winds = [r["wind_max"] for r in daily_records if r.get("wind_max") is not None]
            
            if valid_temps:
                avg_temp = round(sum(valid_temps) / len(valid_temps), 2)
            if valid_rains:
                total_rain = round(sum(valid_rains), 2)
            if valid_winds:
                max_wind = round(max(valid_winds), 2)
                
            sources_data[provider_id] = {
                "metadata": metadata,
                "daily_data": daily_records,
                "quality_report": quality_report,
                "stats": {
                    "avg_temp": avg_temp,
                    "total_rain": total_rain,
                    "max_wind": max_wind,
                    "available_days": len(daily_records)
                }
            }
            
        # 3. Calcula divergências comparativas
        comparison_metrics = {}
        
        # Open-Meteo vs NASA POWER
        if "open_meteo" in sources_data and "nasa_power" in sources_data and sources_data["nasa_power"]["daily_data"]:
            om_s = sources_data["open_meteo"]["stats"]
            np_s = sources_data["nasa_power"]["stats"]
            
            diff_temp = round(abs(om_s["avg_temp"] - np_s["avg_temp"]), 2)
            div_temp_pct = round((diff_temp / max(abs(om_s["avg_temp"]), 1.0)) * 100, 2)
            
            diff_rain = round(abs(om_s["total_rain"] - np_s["total_rain"]), 2)
            div_rain_pct = round((diff_rain / max(om_s["total_rain"], np_s["total_rain"], 1.0)) * 100, 2)
            
            diff_wind = round(abs(om_s["max_wind"] - np_s["max_wind"]), 2)
            div_wind_pct = round((diff_wind / max(om_s["max_wind"], np_s["max_wind"], 1.0)) * 100, 2)
            
            comparison_metrics["open_meteo_vs_nasa_power"] = {
                "diff_temp": diff_temp,
                "div_temp_pct": div_temp_pct,
                "diff_rain": diff_rain,
                "div_rain_pct": div_rain_pct,
                "diff_wind": diff_wind,
                "div_wind_pct": div_wind_pct
            }
            
        # Open-Meteo vs INMET
        if "open_meteo" in sources_data and "inmet" in sources_data and sources_data["inmet"]["daily_data"]:
            om_s = sources_data["open_meteo"]["stats"]
            in_s = sources_data["inmet"]["stats"]
            
            diff_temp = round(abs(om_s["avg_temp"] - in_s["avg_temp"]), 2)
            div_temp_pct = round((diff_temp / max(abs(om_s["avg_temp"]), 1.0)) * 100, 2)
            
            diff_rain = round(abs(om_s["total_rain"] - in_s["total_rain"]), 2)
            div_rain_pct = round((diff_rain / max(om_s["total_rain"], in_s["total_rain"], 1.0)) * 100, 2)
            
            diff_wind = round(abs(om_s["max_wind"] - in_s["max_wind"]), 2)
            div_wind_pct = round((diff_wind / max(om_s["max_wind"], in_s["max_wind"], 1.0)) * 100, 2)
            
            comparison_metrics["open_meteo_vs_inmet"] = {
                "diff_temp": diff_temp,
                "div_temp_pct": div_temp_pct,
                "diff_rain": diff_rain,
                "div_rain_pct": div_rain_pct,
                "diff_wind": diff_wind,
                "div_wind_pct": div_wind_pct
            }
            
        # 4. Gera resumo
        summary = self._generate_scientific_summary(city_name, start_date, end_date, sources_data, comparison_metrics, nearest_station)
        
        result_payload = {
            "city_name": city_name,
            "latitude": lat,
            "longitude": lon,
            "start_date": start_date,
            "end_date": end_date,
            "nearest_station": nearest_station,
            "sources_data": sources_data,
            "comparison_metrics": comparison_metrics,
            "summary": summary
        }
        
        # 5. Salva comparação no banco de dados para histórico
        try:
            db_comparison = SourceComparison(
                city_name=city_name,
                latitude=lat,
                longitude=lon,
                start_date=start_date,
                end_date=end_date,
                comparison_data=result_payload
            )
            db.add(db_comparison)
            db.commit()
        except Exception as ex:
            db.rollback()
            logger.error(f"Erro ao salvar SourceComparison audit log: {ex}")
            
        return result_payload

    def _generate_scientific_summary(self, city_name: str, start_date: str, end_date: str, sources_data: Dict[str, Any], comparison_metrics: Dict[str, Any], nearest_station: Optional[Dict[str, Any]]) -> str:
        summary_lines = [
            f"Análise comparativa científica para {city_name} de {start_date} a {end_date}."
        ]
        
        if nearest_station:
            dist = nearest_station.get("distance", 0.0)
            summary_lines.append(
                f"A estação oficial de solo mais próxima do INMET é a '{nearest_station['name']}' ({nearest_station['id']}), distante {dist:.1f} km."
            )
        else:
            summary_lines.append("Nenhuma estação física terrestre do INMET foi detectada no banco de dados para fins de comparação local.")
            
        if "open_meteo_vs_nasa_power" in comparison_metrics:
            om_np = comparison_metrics["open_meteo_vs_nasa_power"]
            summary_lines.append(
                f"Entre as fontes baseadas em modelos e satélites (Open-Meteo vs NASA POWER), houve uma divergência de {om_np['diff_temp']}°C "
                f"({om_np['div_temp_pct']}%) em temperatura média e de {om_np['diff_rain']} mm ({om_np['div_rain_pct']}%) no acumulado de chuvas."
            )
            
        if "open_meteo_vs_inmet" in comparison_metrics:
            om_in = comparison_metrics["open_meteo_vs_inmet"]
            grade = sources_data["inmet"]["quality_report"]["quality_grade"]
            completeness = sources_data["inmet"]["quality_report"]["completeness_percentage"]
            summary_lines.append(
                f"Na comparação direta com a estação de solo do INMET, os desvios do Open-Meteo foram de {om_in['diff_temp']}°C "
                f"e {om_in['diff_rain']} mm. O INMET teve uma qualidade classificada como '{grade}' (completude de {completeness}%)."
            )
            
        # Comentário de consistência
        if "open_meteo_vs_inmet" in comparison_metrics and "open_meteo_vs_nasa_power" in comparison_metrics:
            div_in = comparison_metrics["open_meteo_vs_inmet"]["div_temp_pct"]
            div_np = comparison_metrics["open_meteo_vs_nasa_power"]["div_temp_pct"]
            if div_in > 15.0 or div_np > 15.0:
                summary_lines.append("Nota-se uma divergência estatística significativa entre as fontes, o que sugere instabilidade climatológica local ou microclimas de relevo acidentado.")
            else:
                summary_lines.append("As fontes meteorológicas apresentaram boa correlação e consistência estatística mútua para o período.")
                
        return " ".join(summary_lines)

weather_service = WeatherService()

