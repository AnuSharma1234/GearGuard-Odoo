from sqlalchemy import Column, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base
from app.models.maintenance_request import RequestStage


class RequestAuditLog(Base):
    __tablename__ = "request_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("maintenance_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    old_stage = Column(SQLEnum(RequestStage, name="request_stage"))
    new_stage = Column(SQLEnum(RequestStage, name="request_stage"), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    changed_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    request = relationship("MaintenanceRequest", back_populates="audit_logs")
    changed_by_user = relationship("User", foreign_keys=[changed_by])
