from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.time_log import TimeLogCreate, TimeLogUpdate, TimeLogResponse, TimeLogDetailResponse
from app.crud import time_log as crud_time_log
from app.core.security import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/api/time-logs", tags=["Time Logs"])


@router.get("/", response_model=list[TimeLogDetailResponse])
async def list_time_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    request_id: UUID | None = None,
    technician_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all time logs with filters."""
    time_logs = crud_time_log.get_time_logs(
        db,
        skip=skip,
        limit=limit,
        request_id=request_id,
        technician_id=technician_id
    )
    
    result = []
    for log in time_logs:
        result.append(TimeLogDetailResponse(
            id=log.id,
            request_id=log.request_id,
            request_subject=log.request.subject,
            technician_id=log.technician_id,
            technician_name=log.technician.user.name,
            hours_spent=log.hours_spent,
            logged_at=log.logged_at
        ))
    
    return result


@router.get("/{time_log_id}", response_model=TimeLogDetailResponse)
async def get_time_log(
    time_log_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific time log."""
    time_log = crud_time_log.get_time_log(db, time_log_id)
    if not time_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Time log not found")
    
    return TimeLogDetailResponse(
        id=time_log.id,
        request_id=time_log.request_id,
        request_subject=time_log.request.subject,
        technician_id=time_log.technician_id,
        technician_name=time_log.technician.user.name,
        hours_spent=time_log.hours_spent,
        logged_at=time_log.logged_at
    )


@router.post("/", response_model=TimeLogResponse, status_code=status.HTTP_201_CREATED)
async def create_time_log(
    time_log: TimeLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager", "technician"))
):
    """Create a new time log (admin/manager/technician only)."""
    new_time_log = crud_time_log.create_time_log(db, time_log)
    return TimeLogResponse.model_validate(new_time_log)


@router.patch("/{time_log_id}", response_model=TimeLogResponse)
async def update_time_log(
    time_log_id: UUID,
    time_log: TimeLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager", "technician"))
):
    """Update a time log (admin/manager/technician only)."""
    updated_time_log = crud_time_log.update_time_log(db, time_log_id, time_log)
    if not updated_time_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Time log not found")
    
    return TimeLogResponse.model_validate(updated_time_log)


@router.delete("/{time_log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_time_log(
    time_log_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    """Delete a time log (admin/manager only)."""
    success = crud_time_log.delete_time_log(db, time_log_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Time log not found")
    
    return None
