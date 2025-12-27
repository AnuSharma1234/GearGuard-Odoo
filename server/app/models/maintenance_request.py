import enum
from sqlalchemy import Column, String, Text, Date, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base


class RequestType(str, enum.Enum):
    corrective = "corrective"
    preventive = "preventive"


class RequestStage(str, enum.Enum):
    new = "new"
    in_progress = "in_progress"
    repaired = "repaired"
    scrap = "scrap"


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject = Column(String, nullable=False)
    description = Column(Text)
    request_type = Column(SQLEnum(RequestType, name="request_type"), nullable=False)
    equipment_id = Column(UUID(as_uuid=True), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    detected_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("technicians.id", ondelete="SET NULL"), index=True)
    scheduled_date = Column(Date)
    stage = Column(SQLEnum(RequestStage, name="request_stage"), nullable=False, default=RequestStage.new, index=True)
    overdue = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    equipment = relationship("Equipment", back_populates="maintenance_requests")
    detected_by_user = relationship("User", back_populates="detected_requests", foreign_keys=[detected_by])
    assigned_technician = relationship("Technician", back_populates="assigned_requests", foreign_keys=[assigned_to])
    time_logs = relationship("TimeLog", back_populates="request", cascade="all, delete-orphan")
    audit_logs = relationship("RequestAuditLog", back_populates="request", cascade="all, delete-orphan")
