from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


# Base schema
class TimeLogBase(BaseModel):
    request_id: UUID
    technician_id: UUID
    hours_spent: float = Field(..., gt=0)
    logged_at: datetime


# Schema for creating a time log
class TimeLogCreate(TimeLogBase):
    pass


# Schema for updating a time log
class TimeLogUpdate(BaseModel):
    hours_spent: float | None = Field(None, gt=0)
    logged_at: datetime | None = None


# Schema for time log response
class TimeLogResponse(TimeLogBase):
    id: UUID

    model_config = {"from_attributes": True}


# Schema with detailed information
class TimeLogDetailResponse(BaseModel):
    id: UUID
    request_id: UUID
    request_subject: str
    technician_id: UUID
    technician_name: str
    hours_spent: float
    logged_at: datetime

    model_config = {"from_attributes": True}
