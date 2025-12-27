from pydantic import BaseModel


# Schema for reports
class RequestCountByTeam(BaseModel):
    team_name: str
    total_requests: int
    new_requests: int
    in_progress_requests: int
    repaired_requests: int
    scrap_requests: int


class RequestCountByCategory(BaseModel):
    category: str
    total_requests: int
    new_requests: int
    in_progress_requests: int
    repaired_requests: int
    scrap_requests: int


class RequestCountByStage(BaseModel):
    stage: str
    count: int
