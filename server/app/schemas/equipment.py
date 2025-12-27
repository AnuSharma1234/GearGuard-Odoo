from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel
from app.models.equipment import EquipmentStatus


# Base schema
class EquipmentBase(BaseModel):
    name: str
    serial_number: str
    category: str
    department_id: UUID
    assigned_employee: str | None = None
    location: str
    purchase_date: date | None = None
    warranty_expiry: date | None = None
    maintenance_team_id: UUID
    status: EquipmentStatus = EquipmentStatus.active


# Schema for creating equipment
class EquipmentCreate(EquipmentBase):
    pass


# Schema for updating equipment
class EquipmentUpdate(BaseModel):
    name: str | None = None
    serial_number: str | None = None
    category: str | None = None
    department_id: UUID | None = None
    assigned_employee: str | None = None
    location: str | None = None
    purchase_date: date | None = None
    warranty_expiry: date | None = None
    maintenance_team_id: UUID | None = None
    status: EquipmentStatus | None = None


# Schema for equipment response
class EquipmentResponse(EquipmentBase):
    id: UUID

    model_config = {"from_attributes": True}


# Schema with department and team details
class EquipmentDetailResponse(BaseModel):
    id: UUID
    name: str
    serial_number: str
    category: str
    department_id: UUID
    assigned_employee: str | None
    location: str
    purchase_date: date | None
    warranty_expiry: date | None
    maintenance_team_id: UUID
    status: EquipmentStatus
    request_count: int = 0
    open_request_count: int = 0

    model_config = {"from_attributes": True}
