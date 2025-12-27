from uuid import UUID
from sqlalchemy.orm import Session, joinedload

from app.models.technician import Technician
from app.schemas.technician import TechnicianCreate, TechnicianUpdate


def get_technician(db: Session, technician_id: UUID) -> Technician | None:
    """Get a technician by ID."""
    return db.query(Technician).filter(Technician.id == technician_id).first()


def get_technician_by_user_id(db: Session, user_id: UUID) -> Technician | None:
    """Get a technician by user ID."""
    return db.query(Technician).filter(Technician.user_id == user_id).first()


def get_technicians(db: Session, skip: int = 0, limit: int = 100, team_id: UUID | None = None) -> list[Technician]:
    """Get all technicians with optional team filter."""
    query = db.query(Technician).options(
        joinedload(Technician.user),
        joinedload(Technician.team)
    )
    
    if team_id:
        query = query.filter(Technician.team_id == team_id)
    
    return query.offset(skip).limit(limit).all()


def create_technician(db: Session, technician: TechnicianCreate) -> Technician:
    """Create a new technician."""
    db_technician = Technician(**technician.model_dump())
    db.add(db_technician)
    db.commit()
    db.refresh(db_technician)
    return db_technician


def update_technician(db: Session, technician_id: UUID, technician: TechnicianUpdate) -> Technician | None:
    """Update a technician."""
    db_technician = get_technician(db, technician_id)
    if not db_technician:
        return None
    
    update_data = technician.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_technician, field, value)
    
    db.commit()
    db.refresh(db_technician)
    return db_technician


def delete_technician(db: Session, technician_id: UUID) -> bool:
    """Delete a technician."""
    db_technician = get_technician(db, technician_id)
    if not db_technician:
        return False
    
    db.delete(db_technician)
    db.commit()
    return True
