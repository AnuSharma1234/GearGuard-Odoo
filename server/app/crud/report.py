from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.models.maintenance_request import MaintenanceRequest, RequestStage
from app.models.equipment import Equipment
from app.models.maintenance_team import MaintenanceTeam


def get_requests_by_team(db: Session):
    """Get request counts grouped by maintenance team."""
    return db.query(
        MaintenanceTeam.name.label("team_name"),
        func.count(MaintenanceRequest.id).label("total_requests"),
        func.sum(case((MaintenanceRequest.stage == RequestStage.new, 1), else_=0)).label("new_requests"),
        func.sum(case((MaintenanceRequest.stage == RequestStage.in_progress, 1), else_=0)).label("in_progress_requests"),
        func.sum(case((MaintenanceRequest.stage == RequestStage.repaired, 1), else_=0)).label("repaired_requests"),
        func.sum(case((MaintenanceRequest.stage == RequestStage.scrap, 1), else_=0)).label("scrap_requests"),
    ).join(
        Equipment, MaintenanceRequest.equipment_id == Equipment.id
    ).join(
        MaintenanceTeam, Equipment.maintenance_team_id == MaintenanceTeam.id
    ).group_by(MaintenanceTeam.name).all()


def get_requests_by_category(db: Session):
    """Get request counts grouped by equipment category."""
    return db.query(
        Equipment.category.label("category"),
        func.count(MaintenanceRequest.id).label("total_requests"),
        func.sum(case((MaintenanceRequest.stage == RequestStage.new, 1), else_=0)).label("new_requests"),
        func.sum(case((MaintenanceRequest.stage == RequestStage.in_progress, 1), else_=0)).label("in_progress_requests"),
        func.sum(case((MaintenanceRequest.stage == RequestStage.repaired, 1), else_=0)).label("repaired_requests"),
        func.sum(case((MaintenanceRequest.stage == RequestStage.scrap, 1), else_=0)).label("scrap_requests"),
    ).join(
        Equipment, MaintenanceRequest.equipment_id == Equipment.id
    ).group_by(Equipment.category).all()


def get_requests_by_stage(db: Session):
    """Get request counts grouped by stage."""
    return db.query(
        MaintenanceRequest.stage.label("stage"),
        func.count(MaintenanceRequest.id).label("count")
    ).group_by(MaintenanceRequest.stage).all()
