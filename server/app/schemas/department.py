from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


# Base schema
class DepartmentBase(BaseModel):
    name: str
    description: str | None = None


# Schema for creating a department
class DepartmentCreate(DepartmentBase):
    pass


# Schema for updating a department
class DepartmentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


# Schema for department response
class DepartmentResponse(DepartmentBase):
    id: UUID

    model_config = {"from_attributes": True}
