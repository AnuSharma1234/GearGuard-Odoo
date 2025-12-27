from uuid import UUID
from sqlalchemy.orm import Session, joinedload

from app.models.request_audit_log import RequestAuditLog


def get_audit_log(db: Session, audit_log_id: UUID) -> RequestAuditLog | None:
    """Get audit log by ID."""
    return db.query(RequestAuditLog).filter(RequestAuditLog.id == audit_log_id).first()


def get_audit_logs(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    request_id: UUID | None = None
) -> list[RequestAuditLog]:
    """Get audit logs with optional filters."""
    query = db.query(RequestAuditLog).options(
        joinedload(RequestAuditLog.request),
        joinedload(RequestAuditLog.changed_by_user)
    )
    
    if request_id:
        query = query.filter(RequestAuditLog.request_id == request_id)
    
    return query.order_by(RequestAuditLog.changed_at.desc()).offset(skip).limit(limit).all()
