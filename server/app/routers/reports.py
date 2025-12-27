from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.report import RequestCountByTeam, RequestCountByCategory, RequestCountByStage
from app.crud import report as crud_report
from app.core.security import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/requests-by-team", response_model=list[RequestCountByTeam])
async def get_requests_by_team(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    """Get maintenance request counts grouped by maintenance team (admin/manager only)."""
    results = crud_report.get_requests_by_team(db)
    
    return [
        RequestCountByTeam(
            team_name=row.team_name,
            total_requests=row.total_requests or 0,
            new_requests=row.new_requests or 0,
            in_progress_requests=row.in_progress_requests or 0,
            repaired_requests=row.repaired_requests or 0,
            scrap_requests=row.scrap_requests or 0
        )
        for row in results
    ]


@router.get("/requests-by-category", response_model=list[RequestCountByCategory])
async def get_requests_by_category(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    """Get maintenance request counts grouped by equipment category (admin/manager only)."""
    results = crud_report.get_requests_by_category(db)
    
    return [
        RequestCountByCategory(
            category=row.category,
            total_requests=row.total_requests or 0,
            new_requests=row.new_requests or 0,
            in_progress_requests=row.in_progress_requests or 0,
            repaired_requests=row.repaired_requests or 0,
            scrap_requests=row.scrap_requests or 0
        )
        for row in results
    ]


@router.get("/requests-by-stage", response_model=list[RequestCountByStage])
async def get_requests_by_stage(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    """Get maintenance request counts grouped by stage (admin/manager only)."""
    results = crud_report.get_requests_by_stage(db)
    
    return [
        RequestCountByStage(
            stage=row.stage.value,
            count=row.count or 0
        )
        for row in results
    ]
