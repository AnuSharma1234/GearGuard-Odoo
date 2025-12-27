from sqlalchemy import Column, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base


class TimeLog(Base):
    __tablename__ = "time_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("maintenance_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    technician_id = Column(UUID(as_uuid=True), ForeignKey("technicians.id", ondelete="RESTRICT"), nullable=False, index=True)
    hours_spent = Column(Numeric(5, 2), nullable=False)
    logged_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    request = relationship("MaintenanceRequest", back_populates="time_logs")
    technician = relationship("Technician", back_populates="time_logs")
