import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import weather, history, ml, auth, reports

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

from sqlalchemy import text

# Ensure ml_models folder exists
os.makedirs(os.path.join(os.getcwd(), "ml_models"), exist_ok=True)

# Run database creation with schema self-healing check
try:
    with engine.connect() as conn:
        # Verifica se a tabela principal existe
        table_exists = engine.dialect.has_table(conn, "search_history")
        if table_exists:
            try:
                # Tenta consultar uma das colunas adicionadas na V1
                conn.execute(text("SELECT country FROM search_history LIMIT 1"))
            except Exception:
                logger.warning("Divergência de schema do banco detectada (colunas antigas). Recriando tabelas...")
                Base.metadata.drop_all(bind=engine)
                
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
    
    # Seed de Weather Sources e Weather Stations
    from app.database import SessionLocal
    from app.models import WeatherSource
    from app.services.weather import weather_service
    import asyncio
    
    db = SessionLocal()
    try:
        # Cadastra as fontes se não existirem
        sources = [
            {"id": "open_meteo", "name": "Open-Meteo", "description": "API global de previsão e reanálise meteorológica.", "is_active": True},
            {"id": "nasa_power", "name": "NASA POWER", "description": "Banco de dados meteorológicos globais de satélites e modelos climáticos da NASA.", "is_active": True},
            {"id": "inmet", "name": "INMET", "description": "Instituto Nacional de Meteorologia - Dados observados em estações de superfície no Brasil.", "is_active": True},
            {"id": "mock", "name": "Mock Provider", "description": "Provedor climatológico simulado para testes locais.", "is_active": True}
        ]
        for src_data in sources:
            src = db.query(WeatherSource).filter(WeatherSource.id == src_data["id"]).first()
            if not src:
                db.add(WeatherSource(**src_data))
        db.commit()
        logger.info("Weather sources seeded successfully.")
        
        # Dispara carga das estações meteorológicas do INMET
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        if loop.is_running():
            loop.create_task(weather_service.seed_stations(db))
        else:
            loop.run_until_complete(weather_service.seed_stations(db))
            
        # Seed de usuário admin padrão para testes
        from app.models import User
        from app.services.auth_service import auth_service
        admin_user = db.query(User).filter(User.email == "admin@atmosview.com").first()
        if not admin_user:
            db.add(User(
                email="admin@atmosview.com",
                hashed_password=auth_service.get_password_hash("admin123"),
                full_name="Administrador AtmosView",
                temperature_unit="C",
                theme="dark"
            ))
            db.commit()
            logger.info("Default admin user seeded successfully (admin@atmosview.com / admin123).")
            
    except Exception as se:
        logger.error(f"Error seeding weather resources on startup: {se}")
    finally:
        db.close()
        
except Exception as e:
    logger.error(f"Error initializing database tables: {e}")


app = FastAPI(
    title="AtmosView API",
    description="Plataforma de análise meteorológica e de risco climático inteligente para cidades brasileiras.",
    version="5.0.0"
)

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict to actual domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "healthy", "version": "5.0.0"}

# Include routers under /api prefix
app.include_router(weather.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(ml.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
