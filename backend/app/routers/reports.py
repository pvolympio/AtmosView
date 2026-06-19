from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import StreamingResponse
from typing import Dict, Any
import logging
from app.services.pdf_service import pdf_service

router = APIRouter(prefix="/reports", tags=["reports"])
logger = logging.getLogger(__name__)

@router.post("/generate")
def generate_report(
    city: str = Body(..., embed=True),
    report_type: str = Body(..., embed=True),  # "dashboard", "history", "comparison", "ml"
    period: str = Body(..., embed=True),
    data: Dict[str, Any] = Body(..., embed=True)
):
    """
    Generates a structured meteorological report PDF for a city and date range/period,
    returning it as a downloadable StreamingResponse.
    """
    logger.info(f"Generating PDF report type: '{report_type}' for city: '{city}'")
    try:
        pdf_buffer = pdf_service.generate_report_pdf(
            city_name=city,
            report_type=report_type,
            period_str=period,
            data=data
        )
        
        filename = f"atmosview_relatorio_{report_type}_{city.lower().replace(' ', '_')}.pdf"
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        logger.error(f"Failed to generate PDF report: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Falha na geração do relatório em PDF: {str(e)}"
        )
