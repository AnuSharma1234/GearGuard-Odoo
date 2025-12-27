from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.crud import department as crud_department
from app.core.security import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/api/departments", tags=["Departments"])


@router.get("/", response_model=list[DepartmentResponse])
async def list_departments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all departments."""
    departments = crud_department.get_departments(db, skip=skip, limit=limit)
    return [DepartmentResponse.model_validate(dept) for dept in departments]


@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific department."""
    department = crud_department.get_department(db, department_id)
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    
    return DepartmentResponse.model_validate(department)


@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    """Create a new department (admin/manager only)."""
    new_department = crud_department.create_department(db, department)
    return DepartmentResponse.model_validate(new_department)


@router.patch("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: UUID,
    department: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager"))
):
    """Update a department (admin/manager only)."""
    updated_department = crud_department.update_department(db, department_id, department)
    if not updated_department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    
    return DepartmentResponse.model_validate(updated_department)


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(
    department_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Delete a department (admin only)."""
    success = crud_department.delete_department(db, department_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    
    return None
