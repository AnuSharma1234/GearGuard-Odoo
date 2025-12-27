from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.maintenance_team import MaintenanceTeamCreate, MaintenanceTeamUpdate, MaintenanceTeamResponse
from app.crud import maintenance_team as crud_team
from app.core.security import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/api/maintenance-teams", tags=["Maintenance Teams"])


@router.get("/", response_model=list[MaintenanceTeamResponse])
async def list_teams(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all maintenance teams."""
    teams = crud_team.get_teams(db, skip=skip, limit=limit)
    return [MaintenanceTeamResponse.model_validate(team) for team in teams]


@router.get("/{team_id}", response_model=MaintenanceTeamResponse)
async def get_team(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific maintenance team."""
    team = crud_team.get_team(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance team not found")
    
    return MaintenanceTeamResponse.model_validate(team)


@router.post("/", response_model=MaintenanceTeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    team: MaintenanceTeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    """Create a new maintenance team (admin/manager only)."""
    new_team = crud_team.create_team(db, team)
    return MaintenanceTeamResponse.model_validate(new_team)


@router.patch("/{team_id}", response_model=MaintenanceTeamResponse)
async def update_team(
    team_id: UUID,
    team: MaintenanceTeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    """Update a maintenance team (admin/manager only)."""
    updated_team = crud_team.update_team(db, team_id, team)
    if not updated_team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance team not found")
    
    return MaintenanceTeamResponse.model_validate(updated_team)


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Delete a maintenance team (admin only)."""
    success = crud_team.delete_team(db, team_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance team not found")
    
    return None
