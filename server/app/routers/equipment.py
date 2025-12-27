from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate, EquipmentResponse, EquipmentDetailResponse
from app.crud import equipment as crud_equipment
from app.core.security import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/api/equipment", tags=["Equipment"])


@router.get("/", response_model=list[EquipmentDetailResponse])
async def list_equipment(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    department_id: UUID | None = None,
    team_id: UUID | None = None,
    category: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all equipment with filters."""
    equipment_list = crud_equipment.get_equipment_list(
        db,
        skip=skip,
        limit=limit,
        department_id=department_id,
        team_id=team_id,
        category=category,
        search=search
    )
    
    equipment_list_with_counts = []
    for eq in equipment_list:
        eq_data, total_requests, open_requests = crud_equipment.get_equipment_with_details(db, eq.id)
        eq_dict = {
            "id": eq.id,
            "name": eq.name,
            "serial_number": eq.serial_number,
            "category": eq.category,
            "department_id": eq.department_id,
            "assigned_employee": eq.assigned_employee,
            "location": eq.location,
            "purchase_date": eq.purchase_date,
            "warranty_expiry": eq.warranty_expiry,
            "maintenance_team_id": eq.maintenance_team_id,
            "status": eq.status,
            "request_count": total_requests or 0,
            "open_request_count": open_requests or 0
        }
        equipment_list_with_counts.append(EquipmentDetailResponse(**eq_dict))
    
    return equipment_list_with_counts


@router.get("/categories", response_model=list[str])
async def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all unique equipment categories."""
    return crud_equipment.get_equipment_categories(db)


@router.get("/{equipment_id}", response_model=EquipmentDetailResponse)
async def get_equipment(
    equipment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific equipment with details."""
    result = crud_equipment.get_equipment_with_details(db, equipment_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    
    equipment, total_requests, open_requests = result
    
    eq_dict = {
        "id": equipment.id,
        "name": equipment.name,
        "serial_number": equipment.serial_number,
        "category": equipment.category,
        "department_id": equipment.department_id,
        "assigned_employee": equipment.assigned_employee,
        "location": equipment.location,
        "purchase_date": equipment.purchase_date,
        "warranty_expiry": equipment.warranty_expiry,
        "maintenance_team_id": equipment.maintenance_team_id,
        "status": equipment.status,
        "request_count": total_requests or 0,
        "open_request_count": open_requests or 0
    }
    return EquipmentDetailResponse(**eq_dict)


@router.get("/{equipment_id}/maintenance-count", response_model=dict)
async def get_equipment_maintenance_count(
    equipment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Smart button: Get maintenance request count for equipment."""
    result = crud_equipment.get_equipment_with_details(db, equipment_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    
    _, total_requests, open_requests = result
    
    return {
        "equipment_id": equipment_id,
        "total_requests": total_requests or 0,
        "open_requests": open_requests or 0
    }


@router.post("/", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    equipment: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    """Create new equipment (admin/manager only)."""
    new_equipment = crud_equipment.create_equipment(db, equipment)
    return EquipmentResponse.model_validate(new_equipment)


@router.patch("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: UUID,
    equipment: EquipmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    """Update equipment (admin/manager only)."""
    updated_equipment = crud_equipment.update_equipment(db, equipment_id, equipment)
    if not updated_equipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    
    return EquipmentResponse.model_validate(updated_equipment)


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(
    equipment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Delete equipment (admin only)."""
    success = crud_equipment.delete_equipment(db, equipment_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    
    return None
