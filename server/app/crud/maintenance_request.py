from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, and_

from app.models.maintenance_request import MaintenanceRequest, RequestStage, RequestType
from app.models.equipment import Equipment
from app.models.request_audit_log import RequestAuditLog
from app.schemas.maintenance_request import MaintenanceRequestCreate, MaintenanceRequestUpdate


def get_request(db: Session, request_id: UUID) -> MaintenanceRequest | None:
    """Get maintenance request by ID."""
    return db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()


def get_request_with_details(db: Session, request_id: UUID):
    """Get maintenance request with all related data."""
    return db.query(MaintenanceRequest).options(
        joinedload(MaintenanceRequest.equipment).joinedload(Equipment.maintenance_team),
        joinedload(MaintenanceRequest.detected_by_user),
        joinedload(MaintenanceRequest.assigned_technician)
    ).filter(MaintenanceRequest.id == request_id).first()


def get_requests(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    equipment_id: UUID | None = None,
    assigned_to: UUID | None = None,
    stage: RequestStage | None = None,
    request_type: RequestType | None = None,
    search: str | None = None
) -> list[MaintenanceRequest]:
    """Get maintenance requests with optional filters."""
    query = db.query(MaintenanceRequest).options(
        joinedload(MaintenanceRequest.equipment),
        joinedload(MaintenanceRequest.detected_by_user),
        joinedload(MaintenanceRequest.assigned_technician)
    )
    
    if equipment_id:
        query = query.filter(MaintenanceRequest.equipment_id == equipment_id)
    
    if assigned_to:
        query = query.filter(MaintenanceRequest.assigned_to == assigned_to)
    
    if stage:
        query = query.filter(MaintenanceRequest.stage == stage)
    
    if request_type:
        query = query.filter(MaintenanceRequest.request_type == request_type)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                MaintenanceRequest.subject.ilike(search_pattern),
                MaintenanceRequest.description.ilike(search_pattern)
            )
        )
    
    return query.order_by(MaintenanceRequest.created_at.desc()).offset(skip).limit(limit).all()


def get_equipment_auto_fill_data(db: Session, equipment_id: UUID):
    """Get auto-fill data from equipment for creating a request."""
    equipment = db.query(Equipment).options(
        joinedload(Equipment.maintenance_team)
    ).filter(Equipment.id == equipment_id).first()
    
    if not equipment:
        return None
    
    return {
        "equipment_category": equipment.category,
        "maintenance_team_id": equipment.maintenance_team_id,
        "maintenance_team_name": equipment.maintenance_team.name,
        "equipment_location": equipment.location
    }


def create_request(db: Session, request: MaintenanceRequestCreate, detected_by: UUID) -> MaintenanceRequest:
    """Create a new maintenance request."""
    db_request = MaintenanceRequest(
        **request.model_dump(exclude={'scheduled_date'}),
        detected_by=detected_by,
        scheduled_date=request.scheduled_date
    )
    db.add(db_request)
    db.flush()
    
    # Create audit log for initial creation
    audit_log = RequestAuditLog(
        request_id=db_request.id,
        changed_by=detected_by,
        old_stage=None,
        new_stage=RequestStage.new
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(db_request)
    return db_request


def update_request(
    db: Session,
    request_id: UUID,
    request: MaintenanceRequestUpdate,
    changed_by: UUID
) -> MaintenanceRequest | None:
    """Update a maintenance request."""
    db_request = get_request(db, request_id)
    if not db_request:
        return None
    
    old_stage = db_request.stage
    update_data = request.model_dump(exclude_unset=True)
    
    # Handle stage transitions
    new_stage = update_data.get('stage')
    if new_stage and new_stage != old_stage:
        # Create audit log for stage change
        audit_log = RequestAuditLog(
            request_id=request_id,
            changed_by=changed_by,
            old_stage=old_stage,
            new_stage=new_stage
        )
        db.add(audit_log)
    
    # Apply updates
    for field, value in update_data.items():
        setattr(db_request, field, value)
    
    db.commit()
    db.refresh(db_request)
    return db_request


def delete_request(db: Session, request_id: UUID) -> bool:
    """Delete a maintenance request."""
    db_request = get_request(db, request_id)
    if not db_request:
        return False
    
    db.delete(db_request)
    db.commit()
    return True


def get_calendar_requests(db: Session, start_date: datetime, end_date: datetime) -> list[MaintenanceRequest]:
    """Get all requests scheduled within a date range (for calendar view)."""
    return db.query(MaintenanceRequest).options(
        joinedload(MaintenanceRequest.equipment),
        joinedload(MaintenanceRequest.assigned_technician)
    ).filter(
        MaintenanceRequest.scheduled_date.between(start_date, end_date)
    ).all()


def get_overdue_requests(db: Session) -> list[MaintenanceRequest]:
    """Get all overdue maintenance requests."""
    now = datetime.utcnow()
    return db.query(MaintenanceRequest).filter(
        and_(
            MaintenanceRequest.scheduled_date < now,
            MaintenanceRequest.stage.in_([RequestStage.new, RequestStage.in_progress])
        )
    ).all()
