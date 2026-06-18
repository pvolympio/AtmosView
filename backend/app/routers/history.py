from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List
import logging
from app.database import get_db
from app.models import SearchHistory
from app.schemas import SearchHistoryResponse

router = APIRouter(prefix="/history", tags=["history"])
logger = logging.getLogger(__name__)

@router.get("", response_model=List[SearchHistoryResponse])
def get_history(db: Session = Depends(get_db)):
    """Retrieves all query history records, ordered by search date descending"""
    try:
        return db.query(SearchHistory).order_by(SearchHistory.searched_at.desc()).all()
    except Exception as e:
        logger.error(f"Failed to query search history: {e}")
        raise HTTPException(status_code=500, detail="Erro ao recuperar histórico de buscas.")

@router.get("/{id}", response_model=SearchHistoryResponse)
def get_history_by_id(
    id: int = Path(..., description="ID da consulta no histórico"),
    db: Session = Depends(get_db)
):
    """Retrieves a single query history log by ID"""
    try:
        record = db.query(SearchHistory).filter(SearchHistory.id == id).first()
        if not record:
            raise HTTPException(status_code=404, detail="Registro de histórico não encontrado.")
        return record
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to query history record ID {id}: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar registro do histórico.")

@router.delete("")
def clear_history(db: Session = Depends(get_db)):
    """Wipes the query history database"""
    try:
        db.query(SearchHistory).delete()
        db.commit()
        return {"status": "success", "message": "Histórico limpo com sucesso."}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to clear search history: {e}")
        raise HTTPException(status_code=500, detail="Erro ao limpar histórico.")
