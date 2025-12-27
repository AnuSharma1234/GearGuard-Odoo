from uuid import UUID
from sqlalchemy.orm import Session

from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate


def get_department(db: Session, department_id: UUID) -> Department | None:
    """Get a department by ID."""
    return db.query(Department).filter(Department.id == department_id).first()


def get_departments(db: Session, skip: int = 0, limit: int = 100) -> list[Department]:
    """Get all departments."""
    return db.query(Department).offset(skip).limit(limit).all()


def create_department(db: Session, department: DepartmentCreate) -> Department:
    """Create a new department."""
    db_department = Department(**department.model_dump())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department


def update_department(db: Session, department_id: UUID, department: DepartmentUpdate) -> Department | None:
    """Update a department."""
    db_department = get_department(db, department_id)
    if not db_department:
        return None
    
    update_data = department.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_department, field, value)
    
    db.commit()
    db.refresh(db_department)
    return db_department


def delete_department(db: Session, department_id: UUID) -> bool:
    """Delete a department."""
    db_department = get_department(db, department_id)
    if not db_department:
        return False
    
    db.delete(db_department)
    db.commit()
    return True
