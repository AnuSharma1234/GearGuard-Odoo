from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.technician import TechnicianCreate, TechnicianUpdate, TechnicianResponse, TechnicianDetailResponse
from app.crud import technician as crud_technician
from app.core.security import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/api/technicians", tags=["Technicians"])


@router.get("/", response_model=list[TechnicianDetailResponse])
async def list_technicians(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    team_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all technicians."""
    technicians = crud_technician.get_technicians(db, skip=skip, limit=limit, team_id=team_id)
    
    return [TechnicianDetailResponse.model_validate(tech) for tech in technicians]


@router.get("/{technician_id}", response_model=TechnicianDetailResponse)
async def get_technician(
    technician_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific technician."""
    technician = crud_technician.get_technician(db, technician_id)
    if not technician:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Technician not found")
    
    return TechnicianDetailResponse.model_validate(technician)


@router.post("/", response_model=TechnicianResponse, status_code=status.HTTP_201_CREATED)
async def create_technician(
    technician: TechnicianCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    """Create a new technician (admin/manager only)."""
    # Check if user is already a technician
    existing = crud_technician.get_technician_by_user_id(db, technician.user_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a technician"
        )
    
    new_technician = crud_technician.create_technician(db, technician)
    return TechnicianResponse.model_validate(new_technician)


@router.patch("/{technician_id}", response_model=TechnicianResponse)
async def update_technician(
    technician_id: UUID,
    technician: TechnicianUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    """Update a technician (admin/manager only)."""
    updated_technician = crud_technician.update_technician(db, technician_id, technician)
    if not updated_technician:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Technician not found")
    
    return TechnicianResponse.model_validate(updated_technician)


@router.delete("/{technician_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_technician(
    technician_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Delete a technician (admin only)."""
    success = crud_technician.delete_technician(db, technician_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Technician not found")
    
    return None
