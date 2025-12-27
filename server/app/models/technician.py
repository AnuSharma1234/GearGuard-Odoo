from sqlalchemy import Column, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class Technician(Base):
    __tablename__ = "technicians"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    team_id = Column(UUID(as_uuid=True), ForeignKey("maintenance_teams.id", ondelete="RESTRICT"), nullable=False, index=True)
    is_active = Column(Boolean, nullable=False, default=True)

    # Relationships
    user = relationship("User", back_populates="technician")
    team = relationship("MaintenanceTeam", back_populates="technicians")
    assigned_requests = relationship("MaintenanceRequest", back_populates="assigned_technician", foreign_keys="MaintenanceRequest.assigned_to")
    time_logs = relationship("TimeLog", back_populates="technician")
