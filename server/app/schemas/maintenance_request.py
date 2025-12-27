from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel, Field, field_validator, model_validator
from app.models.maintenance_request import RequestType, RequestStage


# Base schema
class MaintenanceRequestBase(BaseModel):
    subject: str
    description: str | None = None
    request_type: RequestType = RequestType.corrective
    equipment_id: UUID
    scheduled_date: date | None = None

    @model_validator(mode='after')
    def validate_preventive_date(self):
        """Ensure preventive maintenance has a scheduled date"""
        if self.request_type == RequestType.preventive and self.scheduled_date is None:
            raise ValueError('Preventive maintenance must have a scheduled_date')
        return self


# Schema for creating a request (auto-fills from equipment)
class MaintenanceRequestCreate(MaintenanceRequestBase):
    pass


# Schema for updating a request
class MaintenanceRequestUpdate(BaseModel):
    subject: str | None = None
    description: str | None = None
    request_type: RequestType | None = None
    assigned_to: UUID | None = None
    stage: RequestStage | None = None
    scheduled_date: date | None = None


# Schema for request response
class MaintenanceRequestResponse(MaintenanceRequestBase):
    id: UUID
    detected_by: UUID
    assigned_to: UUID | None
    stage: RequestStage
    created_at: datetime
    overdue: bool

    model_config = {"from_attributes": True}


# Schema with detailed information
class MaintenanceRequestDetailResponse(BaseModel):
    id: UUID
    subject: str
    description: str | None
    request_type: RequestType
    equipment_id: UUID
    equipment_name: str
    equipment_category: str
    equipment_location: str
    detected_by: UUID
    detected_by_name: str
    assigned_to: UUID | None
    assigned_to_name: str | None
    maintenance_team_id: UUID
    maintenance_team_name: str
    stage: RequestStage
    scheduled_date: date | None
    created_at: datetime
    overdue: bool
    is_overdue: bool = False

    model_config = {"from_attributes": True}


# Schema for auto-fill data
class MaintenanceRequestAutoFill(BaseModel):
    equipment_category: str
    maintenance_team_id: UUID
    maintenance_team_name: str
    equipment_location: str
