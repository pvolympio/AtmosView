from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Any

class CitySearchResult(BaseModel):
    name: str
    latitude: float
    longitude: float
    state: Optional[str] = None
    country: str

class SearchHistoryResponse(BaseModel):
    id: int
    city_name: str
    state: Optional[str] = None
    country: str
    latitude: float
    longitude: float
    
    # Principais dados climáticos
    temperature: float
    apparent_temperature: float
    relative_humidity: float
    surface_pressure: float
    wind_speed: float
    precipitation: float
    weather_code: int
    
    # Risco calculado
    risk_score: float
    risk_level: str
    
    # Resumo
    summary: str
    
    # Dados brutos salvos
    raw_data: Any
    
    searched_at: datetime

    class Config:
        from_attributes = True

class RiskAssessment(BaseModel):
    score: float
    nivel: str  # Baixo, Moderado, Alto, Crítico
    motivos: List[str]
    recomendacoes: List[str]

class CurrentWeather(BaseModel):
    temperature: float
    apparent_temperature: float
    relative_humidity: float
    surface_pressure: float
    wind_speed: float
    precipitation: float
    weather_code: int
    observation_time: str

class HourlyForecast(BaseModel):
    time: List[str]
    temperature_2m: List[float]
    relative_humidity_2m: List[float]
    precipitation_probability: List[float]
    weather_code: List[int]

class DailyForecast(BaseModel):
    time: List[str]
    temperature_2m_max: List[float]
    temperature_2m_min: List[float]
    precipitation_sum: List[float]
    wind_speed_10m_max: List[float]
    weather_code: List[int]

class WeatherResponse(BaseModel):
    city_name: str
    state: Optional[str] = None
    country: str
    latitude: float
    longitude: float
    current: CurrentWeather
    risk: RiskAssessment
    summary: str
    hourly: HourlyForecast
    daily: DailyForecast

# Schemas para a V2 (Análise Histórica e Comparação)

class HistoricalDailyDataResponse(BaseModel):
    date: str
    max_temp: float
    min_temp: float
    mean_temp: float
    rain: float
    wind_max: float

    class Config:
        from_attributes = True

class HistoricalStats(BaseModel):
    avg_temp: float
    max_temp: float
    max_temp_date: str
    min_temp: float
    min_temp_date: str
    total_rain: float
    avg_rain: float
    max_rain: float
    max_rain_date: str
    days_no_rain: int
    days_relevant_rain: int
    days_hot: int

class TrendAnalysis(BaseModel):
    slope: float
    interpretation: str  # tendência de aquecimento, tendência de resfriamento, tendência estável

class HistoricalQueryResponse(BaseModel):
    id: int
    city_name: str
    state: Optional[str] = None
    country: str
    latitude: float
    longitude: float
    start_date: str
    end_date: str
    stats: HistoricalStats
    trend: TrendAnalysis
    summary: str
    daily_data: List[HistoricalDailyDataResponse]
    searched_at: datetime

    class Config:
        from_attributes = True

class ComparisonResultResponse(BaseModel):
    city_name: str
    start_a: str
    end_a: str
    start_b: str
    end_b: str
    
    period_a_avg_temp: float
    period_b_avg_temp: float
    temp_diff: float
    
    period_a_total_rain: float
    period_b_total_rain: float
    rain_diff: float
    rain_diff_percent: float
    
    period_a_hot_days: int
    period_b_hot_days: int
    
    period_a_rainy_days: int
    period_b_rainy_days: int
    
    period_a_avg_risk: float
    period_b_avg_risk: float


# Schemas para a V3 (Machine Learning)

class MLTrainRequest(BaseModel):
    city: str
    period_years: Optional[int] = 2

class MLTrainResponse(BaseModel):
    status: str
    city_name: str
    models_trained: int
    samples_used: int
    results: Any  # Contém métricas e importâncias por modelo
    training_run_id: int

class MLPredictionItem(BaseModel):
    prediction_type: str  # "rain", "heavy_rain", "risk"
    label: str
    probability: Optional[float] = None
    source: str  # "ml-model" ou "rule-based"

class MLPredictResponse(BaseModel):
    model_config = {
        "protected_namespaces": ()
    }
    city_name: str
    predictions: List[MLPredictionItem]
    model_trained: bool
    last_trained_at: Optional[datetime] = None

class MLModelStatus(BaseModel):
    model_config = {
        "protected_namespaces": ()
    }
    city_name: str
    model_type: str
    algorithm: str
    accuracy: Optional[float] = None
    f1_score: Optional[float] = None
    trained_at: datetime
    samples_count: Optional[int] = None
    importances: Optional[List[Any]] = None

class MLStatusResponse(BaseModel):
    city_name: str
    models: List[MLModelStatus]
    has_trained_models: bool
    training_runs: int

