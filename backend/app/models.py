from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String, index=True, nullable=False)
    state = Column(String, nullable=True)
    country = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Principais dados climáticos
    temperature = Column(Float, nullable=False)
    apparent_temperature = Column(Float, nullable=False)
    relative_humidity = Column(Float, nullable=False)
    surface_pressure = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    precipitation = Column(Float, nullable=False)
    weather_code = Column(Integer, nullable=False)
    
    # Risco calculado
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    
    # Resumo descritivo
    summary = Column(Text, nullable=False)
    
    # Dados brutos salvos da API externa
    raw_data = Column(JSON, nullable=False)
    
    searched_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class HistoricalQuery(Base):
    __tablename__ = "historical_queries"

    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String, index=True, nullable=False)
    state = Column(String, nullable=True)
    country = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    
    stats = Column(JSON, nullable=False)
    trend = Column(JSON, nullable=False)
    summary = Column(Text, nullable=False)
    
    searched_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    daily_data = relationship("HistoricalDailyData", back_populates="query", cascade="all, delete-orphan")

class HistoricalDailyData(Base):
    __tablename__ = "historical_daily_data"

    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("historical_queries.id", ondelete="CASCADE"), nullable=False)
    date = Column(String, index=True, nullable=False)
    
    max_temp = Column(Float, nullable=False)
    min_temp = Column(Float, nullable=False)
    mean_temp = Column(Float, nullable=False)
    rain = Column(Float, nullable=False)
    wind_max = Column(Float, nullable=False)

    query = relationship("HistoricalQuery", back_populates="daily_data")

class ComparisonQuery(Base):
    __tablename__ = "comparison_queries"

    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String, index=True, nullable=False)
    start_a = Column(String, nullable=False)
    end_a = Column(String, nullable=False)
    start_b = Column(String, nullable=False)
    end_b = Column(String, nullable=False)
    
    result_data = Column(JSON, nullable=False)
    searched_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class MLModel(Base):
    __tablename__ = "ml_models"

    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String, index=True, nullable=False)
    model_type = Column(String, nullable=False)  # "rain", "heavy_rain", "risk"
    algorithm = Column(String, nullable=False)    # "RandomForest"
    file_path = Column(String, nullable=False)
    accuracy = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    trained_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    samples_count = Column(Integer, nullable=True)

    metrics = relationship("MLMetrics", back_populates="model", cascade="all, delete-orphan")


class MLTrainingRun(Base):
    __tablename__ = "ml_training_runs"

    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String, index=True, nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="running", nullable=False)  # "running", "completed", "failed"
    error_message = Column(Text, nullable=True)
    samples_used = Column(Integer, nullable=True)


class MLMetrics(Base):
    __tablename__ = "ml_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ml_models.id", ondelete="CASCADE"), nullable=False)
    metric_name = Column(String, nullable=False)  # "accuracy", "precision", "recall", "f1"
    metric_value = Column(Float, nullable=False)

    model = relationship("MLModel", back_populates="metrics")


class MLPrediction(Base):
    __tablename__ = "ml_predictions"

    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String, index=True, nullable=False)
    prediction_type = Column(String, nullable=False)  # "rain", "heavy_rain", "risk"
    prediction_value = Column(String, nullable=False)  # e.g., "1" (chove), "0" (não), ou "Baixo" etc.
    confidence = Column(Float, nullable=True)
    source = Column(String, nullable=False)  # "ml-model" ou "rule-based"
    predicted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class WeatherSource(Base):
    __tablename__ = "weather_sources"

    id = Column(String, primary_key=True)  # "open_meteo", "nasa_power", "inmet", "mock"
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class WeatherStation(Base):
    __tablename__ = "weather_stations"

    id = Column(String, primary_key=True)  # Código da estação (ex: "A701")
    name = Column(String, index=True, nullable=False)
    state = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    altitude = Column(Float, nullable=True)
    source = Column(String, default="inmet", nullable=False)  # "inmet"
    status = Column(String, default="Operante", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class SourceComparison(Base):
    __tablename__ = "source_comparisons"

    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String, index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    start_date = Column(String, nullable=False)  # YYYY-MM-DD
    end_date = Column(String, nullable=False)    # YYYY-MM-DD
    comparison_data = Column(JSON, nullable=False)  # Métricas comparativas
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class DataQualityReport(Base):
    __tablename__ = "data_quality_reports"

    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String, index=True, nullable=False)
    source = Column(String, nullable=False)  # "open_meteo", "nasa_power", "inmet"
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    missing_data_count = Column(Integer, nullable=False)
    extreme_values_count = Column(Integer, nullable=False)
    temporal_gaps = Column(Integer, nullable=False)
    completeness_percentage = Column(Float, nullable=False)
    quality_grade = Column(String, nullable=False)  # "Boa", "Parcial", "Fraca"
    report_data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    favorite_city = Column(String, nullable=True)
    temperature_unit = Column(String, default="C", nullable=False)  # "C" ou "F"
    theme = Column(String, default="dark", nullable=False)  # "dark" ou "light"
    
    # Custom alert limits
    alert_temp_above = Column(Float, nullable=True)
    alert_humidity_below = Column(Float, nullable=True)
    alert_rain_above = Column(Float, nullable=True)
    alert_wind_above = Column(Float, nullable=True)
    alert_risk_level = Column(String, nullable=True)  # Baixo, Moderado, Alto, Crítico
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    favorites = relationship("UserFavorite", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("WeatherAlert", back_populates="user", cascade="all, delete-orphan")


class UserFavorite(Base):
    __tablename__ = "user_favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    city_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    state = Column(String, nullable=True)
    country = Column(String, default="Brasil", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="favorites")


class WeatherAlert(Base):
    __tablename__ = "weather_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    city_name = Column(String, nullable=False)
    alert_type = Column(String, nullable=False)  # "temperature", "humidity", "rain", "wind", "risk"
    alert_value = Column(Float, nullable=False)  # Limite configurado
    measured_value = Column(Float, nullable=False)  # Valor medido real
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="alerts")

