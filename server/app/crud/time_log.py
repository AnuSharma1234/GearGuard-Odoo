from uuid import UUID
from sqlalchemy.orm import Session, joinedload

from app.models.time_log import TimeLog
from app.schemas.time_log import TimeLogCreate, TimeLogUpdate


def get_time_log(db: Session, time_log_id: UUID) -> TimeLog | None:
    """Get time log by ID."""
    return db.query(TimeLog).filter(TimeLog.id == time_log_id).first()


def get_time_logs(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    request_id: UUID | None = None,
    technician_id: UUID | None = None
) -> list[TimeLog]:
    """Get time logs with optional filters."""
    query = db.query(TimeLog).options(
        joinedload(TimeLog.request),
        joinedload(TimeLog.technician)
    )
    
    if request_id:
        query = query.filter(TimeLog.request_id == request_id)
    
    if technician_id:
        query = query.filter(TimeLog.technician_id == technician_id)
    
    return query.order_by(TimeLog.logged_at.desc()).offset(skip).limit(limit).all()


def create_time_log(db: Session, time_log: TimeLogCreate) -> TimeLog:
    """Create a new time log."""
    db_time_log = TimeLog(**time_log.model_dump())
    db.add(db_time_log)
    db.commit()
    db.refresh(db_time_log)
    return db_time_log


def update_time_log(db: Session, time_log_id: UUID, time_log: TimeLogUpdate) -> TimeLog | None:
    """Update a time log."""
    db_time_log = get_time_log(db, time_log_id)
    if not db_time_log:
        return None
    
    update_data = time_log.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_time_log, field, value)
    
    db.commit()
    db.refresh(db_time_log)
    return db_time_log


def delete_time_log(db: Session, time_log_id: UUID) -> bool:
    """Delete a time log."""
    db_time_log = get_time_log(db, time_log_id)
    if not db_time_log:
        return False
    
    db.delete(db_time_log)
    db.commit()
    return True
