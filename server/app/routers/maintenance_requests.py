from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.maintenance_request import (
    MaintenanceRequestCreate,
    MaintenanceRequestUpdate,
    MaintenanceRequestResponse,
    MaintenanceRequestDetailResponse,
    MaintenanceRequestAutoFill
)
from app.crud import maintenance_request as crud_request
from app.models.maintenance_request import RequestStage, RequestType
from app.core.security import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/api/maintenance-requests", tags=["Maintenance Requests"])


@router.get("/", response_model=list[MaintenanceRequestDetailResponse])
async def list_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    equipment_id: UUID | None = None,
    assigned_to: UUID | None = None,
    stage: RequestStage | None = None,
    request_type: RequestType | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all maintenance requests with filters."""
    requests = crud_request.get_requests(
        db,
        skip=skip,
        limit=limit,
        equipment_id=equipment_id,
        assigned_to=assigned_to,
        stage=stage,
        request_type=request_type,
        search=search
    )
    
    # Build detailed response
    result = []
    now = datetime.utcnow().date()
    for req in requests:
        is_overdue = (
            req.scheduled_date is not None and
            req.scheduled_date < now and
            req.stage in [RequestStage.new, RequestStage.in_progress]
        )
        
        result.append(MaintenanceRequestDetailResponse(
            id=req.id,
            subject=req.subject,
            description=req.description,
            request_type=req.request_type,
            equipment_id=req.equipment_id,
            equipment_name=req.equipment.name,
            equipment_category=req.equipment.category,
            equipment_location=req.equipment.location,
            detected_by=req.detected_by,
            detected_by_name=req.detected_by_user.name,
            assigned_to=req.assigned_to,
            assigned_to_name=req.assigned_technician.user.name if req.assigned_technician else None,
            maintenance_team_id=req.equipment.maintenance_team_id,
            maintenance_team_name=req.equipment.maintenance_team.name,
            stage=req.stage,
            scheduled_date=req.scheduled_date,
            created_at=req.created_at,
            overdue=req.overdue,
            is_overdue=is_overdue
        ))
    
    return result


@router.get("/calendar", response_model=list[MaintenanceRequestDetailResponse])
async def get_calendar_requests(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get maintenance requests scheduled within a date range (for calendar view)."""
    requests = crud_request.get_calendar_requests(db, start_date, end_date)
    
    result = []
    for req in requests:
        result.append(MaintenanceRequestDetailResponse(
            id=req.id,
            subject=req.subject,
            description=req.description,
            request_type=req.request_type,
            equipment_id=req.equipment_id,
            equipment_name=req.equipment.name,
            equipment_category=req.equipment.category,
            equipment_location=req.equipment.location,
            detected_by=req.detected_by,
            detected_by_name=req.detected_by_user.name,
            assigned_to=req.assigned_to,
            assigned_to_name=req.assigned_technician.user.name if req.assigned_technician else None,
            maintenance_team_id=req.equipment.maintenance_team_id,
            maintenance_team_name=req.equipment.maintenance_team.name,
            stage=req.stage,
            scheduled_date=req.scheduled_date,
            created_at=req.created_at,
            overdue=req.overdue,
            is_overdue=False
        ))
    
    return result


@router.get("/overdue", response_model=list[MaintenanceRequestDetailResponse])
async def get_overdue_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager", "technician"))
):
    """Get all overdue maintenance requests."""
    requests = crud_request.get_overdue_requests(db)
    
    result = []
    for req in requests:
        result.append(MaintenanceRequestDetailResponse(
            id=req.id,
            subject=req.subject,
            description=req.description,
            request_type=req.request_type,
            equipment_id=req.equipment_id,
            equipment_name=req.equipment.name,
            equipment_category=req.equipment.category,
            equipment_location=req.equipment.location,
            detected_by=req.detected_by,
            detected_by_name=req.detected_by_user.name,
            assigned_to=req.assigned_to,
            assigned_to_name=req.assigned_technician.user.name if req.assigned_technician else None,
            maintenance_team_id=req.equipment.maintenance_team_id,
            maintenance_team_name=req.equipment.maintenance_team.name,
            stage=req.stage,
            scheduled_date=req.scheduled_date,
            created_at=req.created_at,
            overdue=req.overdue,
            is_overdue=True
        ))
    
    return result


@router.get("/equipment/{equipment_id}/auto-fill", response_model=MaintenanceRequestAutoFill)
async def get_auto_fill_data(
    equipment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get auto-fill data from equipment for creating a maintenance request."""
    auto_fill_data = crud_request.get_equipment_auto_fill_data(db, equipment_id)
    if not auto_fill_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    
    return MaintenanceRequestAutoFill(**auto_fill_data)


@router.get("/{request_id}", response_model=MaintenanceRequestDetailResponse)
async def get_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific maintenance request with details."""
    request = crud_request.get_request_with_details(db, request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance request not found")
    
    now = datetime.utcnow().date()
    is_overdue = (
        request.scheduled_date is not None and
        request.scheduled_date < now and
        request.stage in [RequestStage.new, RequestStage.in_progress]
    )
    
    return MaintenanceRequestDetailResponse(
        id=request.id,
        subject=request.subject,
        description=request.description,
        request_type=request.request_type,
        equipment_id=request.equipment_id,
        equipment_name=request.equipment.name,
        equipment_category=request.equipment.category,
        equipment_location=request.equipment.location,
        detected_by=request.detected_by,
        detected_by_name=request.detected_by_user.name,
        assigned_to=request.assigned_to,
        assigned_to_name=request.assigned_technician.user.name if request.assigned_technician else None,
        maintenance_team_id=request.equipment.maintenance_team_id,
        maintenance_team_name=request.equipment.maintenance_team.name,
        stage=request.stage,
        scheduled_date=request.scheduled_date,
        created_at=request.created_at,
        overdue=request.overdue,
        is_overdue=is_overdue
    )


@router.post("/", response_model=MaintenanceRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    request: MaintenanceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new maintenance request."""
    new_request = crud_request.create_request(db, request, detected_by=current_user.id)
    return MaintenanceRequestResponse.model_validate(new_request)


@router.patch("/{request_id}", response_model=MaintenanceRequestResponse)
async def update_request(
    request_id: UUID,
    request: MaintenanceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a maintenance request."""
    updated_request = crud_request.update_request(db, request_id, request, changed_by=current_user.id)
    if not updated_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance request not found")
    
    return MaintenanceRequestResponse.model_validate(updated_request)


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    """Delete a maintenance request (admin/manager only)."""
    success = crud_request.delete_request(db, request_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance request not found")
    
    return None
