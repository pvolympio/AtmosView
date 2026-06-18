import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

# Tenta conectar ao PostgreSQL. Se falhar, usa SQLite local automaticamente.
try:
    # Usando timeout pequeno para falhar rápido caso o host não esteja acessível
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 3} if "postgresql" in settings.DATABASE_URL else {}
    )
    # Testa a conexão
    with engine.connect() as conn:
        logger.info("Conectado ao PostgreSQL com sucesso.")
except Exception as e:
    logger.warning(f"Falha na conexão com PostgreSQL ({e}). Usando banco de dados SQLite local (atmosview.db).")
    engine = create_engine(
        "sqlite:///./atmosview.db",
        connect_args={"check_same_thread": False}  # Necessário para SQLite em multi-thread
    )

# Create session local maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base for models
Base = declarative_base()

# DB Dependency injection to handle session lifecycle
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

