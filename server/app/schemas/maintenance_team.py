from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


# Base schema
class MaintenanceTeamBase(BaseModel):
    name: str
    description: str | None = None


# Schema for creating a team
class MaintenanceTeamCreate(MaintenanceTeamBase):
    pass


# Schema for updating a team
class MaintenanceTeamUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


# Schema for team response
class MaintenanceTeamResponse(MaintenanceTeamBase):
    id: UUID

    model_config = {"from_attributes": True}
