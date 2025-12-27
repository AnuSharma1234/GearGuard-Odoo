from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class MaintenanceTeam(Base):
    __tablename__ = "maintenance_teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    specialization = Column(String)

    # Relationships
    technicians = relationship("Technician", back_populates="team")
    equipment = relationship("Equipment", back_populates="maintenance_team")
