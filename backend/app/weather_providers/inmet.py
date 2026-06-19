import httpx
import logging
import math
from typing import List, Dict, Any, Optional
from app.weather_providers.base import BaseProvider
from app.database import SessionLocal
from app.models import WeatherStation

logger = logging.getLogger(__name__)

class InmetProvider(BaseProvider):
    def get_metadata(self) -> Dict[str, Any]:
        return {
            "id": "inmet",
            "name": "INMET (Estações)",
            "description": "Instituto Nacional de Meteorologia - Dados observados em estações físicas de superfície no Brasil.",
            "source_type": "Estações Físicas",
            "limitations": "Pode apresentar dados ausentes devido a falhas de comunicação ou manutenção física nos sensores locais.",
            "data_coverage": "Brasil (Rede de Estações)"
        }

    async def search_location(self, query: str) -> List[Dict[str, Any]]:
        # INMET is handled via nearest stations in DB.
        return []

    async def get_current_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        return {}

    async def get_forecast(self, lat: float, lon: float) -> Dict[str, Any]:
        return {}

    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    async def get_historical_data(self, lat: float, lon: float, start_date: str, end_date: str, db: Optional[Any] = None) -> List[Dict[str, Any]]:
        # 1. Busca estação mais próxima no banco de dados
        close_db_after = False
        if db is None:
            db = SessionLocal()
            close_db_after = True
        nearest_station = None
        min_distance = float('inf')
        
        try:
            stations = db.query(WeatherStation).all()
            for station in stations:
                dist = self._haversine_distance(lat, lon, station.latitude, station.longitude)
                if dist < min_distance:
                    min_distance = dist
                    nearest_station = station
        except Exception as e:
            logger.error(f"Error querying stations from database: {e}")
        finally:
            if close_db_after:
                db.close()
            
        if not nearest_station:
            logger.warning("No physical weather stations found in database.")
            return []
            
        logger.info(f"Nearest station for ({lat}, {lon}) is {nearest_station.id} - {nearest_station.name} ({min_distance:.2f} km)")
        
        # 2. Consulta a API diária do INMET para a estação
        # Endpoint: https://apitempo.inmet.gov.br/estacao/diaria/{data_inicio}/{data_fim}/{CD_ESTACAO}
        url = f"https://apitempo.inmet.gov.br/estacao/diaria/{start_date}/{end_date}/{nearest_station.id}"
        
        def parse_float(val) -> Optional[float]:
            if val is None or str(val).strip() == "" or str(val).lower() in ("null", "nan"):
                return None
            try:
                return float(str(val).replace(",", "."))
            except ValueError:
                return None
                
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
                
                # Se retornar dicionário com erro ou mensagem
                if isinstance(data, dict) and "message" in data:
                    logger.warning(f"INMET API returned message: {data['message']}")
                    return []
                    
                if not isinstance(data, list):
                    return []
                    
                records = []
                for item in data:
                    date_val = item.get("DT_MEDICAO")
                    if not date_val:
                        continue
                        
                    # Mapeia chaves flexíveis do INMET
                    max_temp = parse_float(item.get("TEMP_MAX")) or parse_float(item.get("TEM_MAX"))
                    min_temp = parse_float(item.get("TEMP_MIN")) or parse_float(item.get("TEM_MIN"))
                    mean_temp = parse_float(item.get("TEMP_MED")) or parse_float(item.get("TEM_MED")) or parse_float(item.get("TEMP_MEDIA"))
                    
                    # Se temperatura média estiver nula mas tivermos max e min, estimamos
                    if mean_temp is None and max_temp is not None and min_temp is not None:
                        mean_temp = (max_temp + min_temp) / 2
                        
                    rain = parse_float(item.get("CHUVA")) or parse_float(item.get("PRECIPITACAO")) or 0.0
                    wind = parse_float(item.get("VEL_VENTO_MAX")) or parse_float(item.get("VEN_VEL")) or parse_float(item.get("VEN_MAX")) or 0.0
                    
                    # Converte vento de m/s para km/h se aplicável (INMET costuma registrar vento em m/s)
                    wind_kmh = round(wind * 3.6, 2) if wind is not None else 0.0
                    
                    records.append({
                        "date": date_val,
                        "max_temp": round(max_temp, 2) if max_temp is not None else None,
                        "min_temp": round(min_temp, 2) if min_temp is not None else None,
                        "mean_temp": round(mean_temp, 2) if mean_temp is not None else None,
                        "rain": round(rain, 2) if rain is not None else 0.0,
                        "wind_max": wind_kmh
                    })
                return records
            except Exception as e:
                logger.error(f"Error calling INMET station historical API: {e}")
                # Falha silenciosa para não quebrar a aplicação
                return []
