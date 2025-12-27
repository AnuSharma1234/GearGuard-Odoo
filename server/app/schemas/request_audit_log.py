from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


# Base schema
class RequestAuditLogBase(BaseModel):
    request_id: UUID
    old_stage: str | None
    new_stage: str
    notes: str | None = None


# Schema for audit log response
class RequestAuditLogResponse(RequestAuditLogBase):
    id: UUID
    changed_by: UUID
    changed_at: datetime

    model_config = {"from_attributes": True}


# Schema with detailed information
class RequestAuditLogDetailResponse(BaseModel):
    id: UUID
    request_id: UUID
    request_subject: str
    changed_by: UUID
    changed_by_name: str
    old_stage: str | None
    new_stage: str
    notes: str | None
    changed_at: datetime

    model_config = {"from_attributes": True}
