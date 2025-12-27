from uuid import UUID
from sqlalchemy.orm import Session

from app.models.maintenance_team import MaintenanceTeam
from app.schemas.maintenance_team import MaintenanceTeamCreate, MaintenanceTeamUpdate


def get_team(db: Session, team_id: UUID) -> MaintenanceTeam | None:
    """Get a maintenance team by ID."""
    return db.query(MaintenanceTeam).filter(MaintenanceTeam.id == team_id).first()


def get_teams(db: Session, skip: int = 0, limit: int = 100) -> list[MaintenanceTeam]:
    """Get all maintenance teams."""
    return db.query(MaintenanceTeam).offset(skip).limit(limit).all()


def create_team(db: Session, team: MaintenanceTeamCreate) -> MaintenanceTeam:
    """Create a new maintenance team."""
    db_team = MaintenanceTeam(**team.model_dump())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team


def update_team(db: Session, team_id: UUID, team: MaintenanceTeamUpdate) -> MaintenanceTeam | None:
    """Update a maintenance team."""
    db_team = get_team(db, team_id)
    if not db_team:
        return None
    
    update_data = team.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_team, field, value)
    
    db.commit()
    db.refresh(db_team)
    return db_team


def delete_team(db: Session, team_id: UUID) -> bool:
    """Delete a maintenance team."""
    db_team = get_team(db, team_id)
    if not db_team:
        return False
    
    db.delete(db_team)
    db.commit()
    return True
