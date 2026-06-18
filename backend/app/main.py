import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import weather, history, ml

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
except Exception as e:
    logger.error(f"Error initializing database tables: {e}")


app = FastAPI(
    title="AtmosView API",
    description="Plataforma de análise meteorológica e de risco climático inteligente para cidades brasileiras.",
    version="3.0.0"
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
    return {"status": "healthy", "version": "3.0.0"}

# Include routers under /api prefix
app.include_router(weather.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(ml.router, prefix="/api")
