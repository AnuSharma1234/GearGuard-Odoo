from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_

from app.models.equipment import Equipment
from app.models.maintenance_request import MaintenanceRequest, RequestStage
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate


def get_equipment(db: Session, equipment_id: UUID) -> Equipment | None:
    """Get equipment by ID."""
    return db.query(Equipment).filter(Equipment.id == equipment_id).first()


def get_equipment_with_details(db: Session, equipment_id: UUID):
    """Get equipment with department, team, and request counts."""
    equipment = db.query(Equipment).options(
        joinedload(Equipment.department),
        joinedload(Equipment.maintenance_team)
    ).filter(Equipment.id == equipment_id).first()
    
    if not equipment:
        return None
    
    # Count total and open requests
    total_requests = db.query(func.count(MaintenanceRequest.id)).filter(
        MaintenanceRequest.equipment_id == equipment_id
    ).scalar()
    
    open_requests = db.query(func.count(MaintenanceRequest.id)).filter(
        MaintenanceRequest.equipment_id == equipment_id,
        MaintenanceRequest.stage.in_([RequestStage.new, RequestStage.in_progress])
    ).scalar()
    
    return equipment, total_requests, open_requests


def get_equipment_list(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    department_id: UUID | None = None,
    team_id: UUID | None = None,
    category: str | None = None,
    search: str | None = None
) -> list[Equipment]:
    """Get all equipment with optional filters."""
    query = db.query(Equipment).options(
        joinedload(Equipment.department),
        joinedload(Equipment.maintenance_team)
    )
    
    if department_id:
        query = query.filter(Equipment.department_id == department_id)
    
    if team_id:
        query = query.filter(Equipment.maintenance_team_id == team_id)
    
    if category:
        query = query.filter(Equipment.category == category)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Equipment.name.ilike(search_pattern),
                Equipment.serial_number.ilike(search_pattern),
                Equipment.location.ilike(search_pattern),
                Equipment.assigned_employee.ilike(search_pattern)
            )
        )
    
    return query.offset(skip).limit(limit).all()


def create_equipment(db: Session, equipment: EquipmentCreate) -> Equipment:
    """Create new equipment."""
    db_equipment = Equipment(**equipment.model_dump())
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment


def update_equipment(db: Session, equipment_id: UUID, equipment: EquipmentUpdate) -> Equipment | None:
    """Update equipment."""
    db_equipment = get_equipment(db, equipment_id)
    if not db_equipment:
        return None
    
    update_data = equipment.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_equipment, field, value)
    
    db.commit()
    db.refresh(db_equipment)
    return db_equipment


def delete_equipment(db: Session, equipment_id: UUID) -> bool:
    """Delete equipment."""
    db_equipment = get_equipment(db, equipment_id)
    if not db_equipment:
        return False
    
    db.delete(db_equipment)
    db.commit()
    return True


def get_equipment_categories(db: Session) -> list[str]:
    """Get all unique equipment categories."""
    categories = db.query(Equipment.category).distinct().all()
    return [cat[0] for cat in categories]
