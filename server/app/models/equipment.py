import enum
from sqlalchemy import Column, String, Date, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class EquipmentStatus(str, enum.Enum):
    active = "active"
    scrapped = "scrapped"


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    serial_number = Column(String, nullable=False, unique=True)
    category = Column(String)
    purchase_date = Column(Date)
    warranty_expiry = Column(Date)
    location = Column(String)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False, index=True)
    assigned_employee = Column(String)
    maintenance_team_id = Column(UUID(as_uuid=True), ForeignKey("maintenance_teams.id", ondelete="RESTRICT"), nullable=False, index=True)
    status = Column(SQLEnum(EquipmentStatus, name="equipment_status"), nullable=False, default=EquipmentStatus.active)

    # Relationships
    department = relationship("Department", back_populates="equipment")
    maintenance_team = relationship("MaintenanceTeam", back_populates="equipment")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="equipment", cascade="all, delete-orphan")
