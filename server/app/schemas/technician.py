from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


# Base schema
class TechnicianBase(BaseModel):
    user_id: UUID
    team_id: UUID
    is_active: bool = True


# Schema for creating a technician
class TechnicianCreate(TechnicianBase):
    pass


# Schema for updating a technician
class TechnicianUpdate(BaseModel):
    team_id: UUID | None = None
    is_active: bool | None = None


# Schema for technician response
class TechnicianResponse(TechnicianBase):
    id: UUID
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


# Schema with user details - import at end of file to avoid circular imports
class TechnicianDetailResponse(BaseModel):
    id: UUID
    user_id: UUID
    team_id: UUID
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
