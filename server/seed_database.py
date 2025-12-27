#!/usr/bin/env python3
"""
Database Seeding Script for GearGuard
This script properly hashes passwords and seeds the database with test data.
Run with: python seed_database.py
"""

import sys
from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy import text
from app.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.department import Department
from app.models.maintenance_team import MaintenanceTeam
from app.models.user import User, UserRole
from app.models.technician import Technician
from app.models.equipment import Equipment, EquipmentStatus
from app.models.maintenance_request import MaintenanceRequest, RequestType, RequestStage
from app.models.time_log import TimeLog
from app.models.request_audit_log import RequestAuditLog


def clear_data(db: SessionLocal):
    """Clear existing data in correct order to respect foreign keys."""
    print("🗑️  Clearing existing data...")
    
    db.execute(text("DELETE FROM time_logs"))
    db.execute(text("DELETE FROM request_audit_logs"))
    db.execute(text("DELETE FROM maintenance_requests"))
    db.execute(text("DELETE FROM equipment"))
    db.execute(text("DELETE FROM technicians"))
    db.execute(text("DELETE FROM maintenance_teams"))
    db.execute(text("DELETE FROM departments"))
    db.execute(text("DELETE FROM users"))
    
    db.commit()
    print("✅ Data cleared successfully")


def seed_departments(db: SessionLocal):
    """Seed departments."""
    print("📁 Seeding departments...")
    
    departments = [
        Department(
            id=UUID("11111111-1111-1111-1111-111111111111"),
            name="IT",
            description="Information Technology Department"
        ),
        Department(
            id=UUID("22222222-2222-2222-2222-222222222222"),
            name="Manufacturing",
            description="Production and Manufacturing"
        ),
        Department(
            id=UUID("33333333-3333-3333-3333-333333333333"),
            name="Facilities",
            description="Building Maintenance and Operations"
        ),
        Department(
            id=UUID("44444444-4444-4444-4444-444444444444"),
            name="Warehouse",
            description="Inventory and Logistics"
        ),
    ]
    
    db.add_all(departments)
    db.commit()
    print(f"✅ Added {len(departments)} departments")


def seed_maintenance_teams(db: SessionLocal):
    """Seed maintenance teams."""
    print("👥 Seeding maintenance teams...")
    
    teams = [
        MaintenanceTeam(
            id=UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            name="IT Support",
            specialization="Computer and Network Equipment"
        ),
        MaintenanceTeam(
            id=UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            name="Mechanical Team",
            specialization="Industrial Machinery"
        ),
        MaintenanceTeam(
            id=UUID("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            name="Building Maintenance",
            specialization="HVAC and Electrical Systems"
        ),
        MaintenanceTeam(
            id=UUID("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            name="Material Handling",
            specialization="Forklifts and Conveyors"
        ),
    ]
    
    db.add_all(teams)
    db.commit()
    print(f"✅ Added {len(teams)} maintenance teams")


def seed_users(db: SessionLocal):
    """Seed users with properly hashed passwords."""
    print("👤 Seeding users (this may take a moment for bcrypt hashing)...")
    
    # Default password for all test users
    default_password = "password123"
    hashed_password = get_password_hash(default_password)
    
    users = [
        # Admin
        User(
            id=UUID("00000000-0000-0000-0000-000000000001"),
            name="Alice Admin",
            email="alice.admin@gearguard.com",
            role=UserRole.admin,
            password_hash=hashed_password,
            is_active=True
        ),
        
        # Managers
        User(
            id=UUID("00000000-0000-0000-0000-000000000002"),
            name="Bob Manager",
            email="bob.manager@gearguard.com",
            role=UserRole.manager,
            password_hash=hashed_password,
            is_active=True
        ),
        User(
            id=UUID("00000000-0000-0000-0000-000000000003"),
            name="Carol Manager",
            email="carol.manager@gearguard.com",
            role=UserRole.manager,
            password_hash=hashed_password,
            is_active=True
        ),
        
        # Technicians
        User(
            id=UUID("00000000-0000-0000-0000-000000000010"),
            name="Dave Technician",
            email="dave.tech@gearguard.com",
            role=UserRole.technician,
            password_hash=hashed_password,
            is_active=True
        ),
        User(
            id=UUID("00000000-0000-0000-0000-000000000011"),
            name="Eve Technician",
            email="eve.tech@gearguard.com",
            role=UserRole.technician,
            password_hash=hashed_password,
            is_active=True
        ),
        User(
            id=UUID("00000000-0000-0000-0000-000000000012"),
            name="Frank Technician",
            email="frank.tech@gearguard.com",
            role=UserRole.technician,
            password_hash=hashed_password,
            is_active=True
        ),
        User(
            id=UUID("00000000-0000-0000-0000-000000000013"),
            name="Grace Technician",
            email="grace.tech@gearguard.com",
            role=UserRole.technician,
            password_hash=hashed_password,
            is_active=True
        ),
        
        # Regular Users
        User(
            id=UUID("00000000-0000-0000-0000-000000000020"),
            name="Henry User",
            email="henry.user@gearguard.com",
            role=UserRole.user,
            password_hash=hashed_password,
            is_active=True
        ),
        User(
            id=UUID("00000000-0000-0000-0000-000000000021"),
            name="Iris User",
            email="iris.user@gearguard.com",
            role=UserRole.user,
            password_hash=hashed_password,
            is_active=True
        ),
        User(
            id=UUID("00000000-0000-0000-0000-000000000022"),
            name="Jack User",
            email="jack.user@gearguard.com",
            role=UserRole.user,
            password_hash=hashed_password,
            is_active=True
        ),
    ]
    
    db.add_all(users)
    db.commit()
    print(f"✅ Added {len(users)} users (password: '{default_password}')")


def seed_technicians(db: SessionLocal):
    """Seed technicians (mapping users to teams)."""
    print("🔧 Seeding technicians...")
    
    technicians = [
        Technician(
            id=UUID("10000000-0000-0000-0000-000000000001"),
            user_id=UUID("00000000-0000-0000-0000-000000000010"),
            team_id=UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            is_active=True
        ),
        Technician(
            id=UUID("10000000-0000-0000-0000-000000000002"),
            user_id=UUID("00000000-0000-0000-0000-000000000011"),
            team_id=UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            is_active=True
        ),
        Technician(
            id=UUID("10000000-0000-0000-0000-000000000003"),
            user_id=UUID("00000000-0000-0000-0000-000000000012"),
            team_id=UUID("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            is_active=True
        ),
        Technician(
            id=UUID("10000000-0000-0000-0000-000000000004"),
            user_id=UUID("00000000-0000-0000-0000-000000000013"),
            team_id=UUID("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            is_active=True
        ),
    ]
    
    db.add_all(technicians)
    db.commit()
    print(f"✅ Added {len(technicians)} technicians")


def seed_equipment(db: SessionLocal):
    """Seed equipment."""
    print("🔨 Seeding equipment...")
    
    equipment_list = [
        # IT Equipment
        Equipment(
            id=UUID("e0000000-0000-0000-0000-000000000001"),
            name="Dell Server R740",
            serial_number="SRV-2024-001",
            category="Server",
            purchase_date=datetime(2024, 1, 15).date(),
            warranty_expiry=datetime(2027, 1, 15).date(),
            location="Server Room A",
            department_id=UUID("11111111-1111-1111-1111-111111111111"),
            assigned_employee="IT Department",
            maintenance_team_id=UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            status=EquipmentStatus.active
        ),
        Equipment(
            id=UUID("e0000000-0000-0000-0000-000000000002"),
            name="Network Switch Cisco 3850",
            serial_number="NET-2023-042",
            category="Network",
            purchase_date=datetime(2023, 6, 20).date(),
            warranty_expiry=datetime(2026, 6, 20).date(),
            location="Network Closet B2",
            department_id=UUID("11111111-1111-1111-1111-111111111111"),
            assigned_employee="IT Department",
            maintenance_team_id=UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            status=EquipmentStatus.active
        ),
        Equipment(
            id=UUID("e0000000-0000-0000-0000-000000000003"),
            name="Backup Storage NAS",
            serial_number="STO-2022-015",
            category="Storage",
            purchase_date=datetime(2022, 3, 10).date(),
            warranty_expiry=datetime(2025, 3, 10).date(),
            location="Server Room A",
            department_id=UUID("11111111-1111-1111-1111-111111111111"),
            assigned_employee="IT Department",
            maintenance_team_id=UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            status=EquipmentStatus.active
        ),
        
        # Manufacturing Equipment
        Equipment(
            id=UUID("e0000000-0000-0000-0000-000000000010"),
            name="CNC Machine Model X500",
            serial_number="CNC-2020-088",
            category="Machinery",
            purchase_date=datetime(2020, 8, 15).date(),
            warranty_expiry=datetime(2025, 8, 15).date(),
            location="Manufacturing Floor 1",
            department_id=UUID("22222222-2222-2222-2222-222222222222"),
            assigned_employee="Production Team",
            maintenance_team_id=UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            status=EquipmentStatus.active
        ),
        Equipment(
            id=UUID("e0000000-0000-0000-0000-000000000011"),
            name="Industrial Press 50T",
            serial_number="PRS-2019-023",
            category="Machinery",
            purchase_date=datetime(2019, 5, 20).date(),
            warranty_expiry=datetime(2024, 5, 20).date(),
            location="Manufacturing Floor 2",
            department_id=UUID("22222222-2222-2222-2222-222222222222"),
            assigned_employee="Production Team",
            maintenance_team_id=UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            status=EquipmentStatus.active
        ),
        Equipment(
            id=UUID("e0000000-0000-0000-0000-000000000012"),
            name="Assembly Line Conveyor",
            serial_number="CNV-2021-047",
            category="Conveyor",
            purchase_date=datetime(2021, 11, 10).date(),
            warranty_expiry=datetime(2026, 11, 10).date(),
            location="Assembly Area",
            department_id=UUID("22222222-2222-2222-2222-222222222222"),
            assigned_employee="Production Team",
            maintenance_team_id=UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            status=EquipmentStatus.active
        ),
        
        # Facilities Equipment
        Equipment(
            id=UUID("e0000000-0000-0000-0000-000000000020"),
            name="HVAC Unit Carrier 50T",
            serial_number="HVAC-2018-012",
            category="HVAC",
            purchase_date=datetime(2018, 4, 15).date(),
            warranty_expiry=datetime(2023, 4, 15).date(),
            location="Roof Building A",
            department_id=UUID("33333333-3333-3333-3333-333333333333"),
            assigned_employee="Facilities",
            maintenance_team_id=UUID("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            status=EquipmentStatus.active
        ),
        Equipment(
            id=UUID("e0000000-0000-0000-0000-000000000021"),
            name="Emergency Generator 200kW",
            serial_number="GEN-2020-003",
            category="Generator",
            purchase_date=datetime(2020, 2, 10).date(),
            warranty_expiry=datetime(2025, 2, 10).date(),
            location="Equipment Yard",
            department_id=UUID("33333333-3333-3333-3333-333333333333"),
            assigned_employee="Facilities",
            maintenance_team_id=UUID("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            status=EquipmentStatus.active
        ),
        Equipment(
            id=UUID("e0000000-0000-0000-0000-000000000022"),
            name="Elevator System Otis",
            serial_number="ELV-2015-008",
            category="Elevator",
            purchase_date=datetime(2015, 9, 20).date(),
            warranty_expiry=datetime(2020, 9, 20).date(),
            location="Building A Main",
            department_id=UUID("33333333-3333-3333-3333-333333333333"),
            assigned_employee="Facilities",
            maintenance_team_id=UUID("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            status=EquipmentStatus.active
        ),
        
        # Warehouse Equipment
        Equipment(
            id=UUID("e0000000-0000-0000-0000-000000000030"),
            name="Forklift Toyota 8FGU25",
            serial_number="FLT-2022-034",
            category="Forklift",
            purchase_date=datetime(2022, 7, 15).date(),
            warranty_expiry=datetime(2027, 7, 15).date(),
            location="Warehouse Bay 3",
            department_id=UUID("44444444-4444-4444-4444-444444444444"),
            assigned_employee="Warehouse Staff",
            maintenance_team_id=UUID("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            status=EquipmentStatus.active
        ),
        Equipment(
            id=UUID("e0000000-0000-0000-0000-000000000031"),
            name="Pallet Jack Electric",
            serial_number="PLJ-2023-012",
            category="Pallet Jack",
            purchase_date=datetime(2023, 3, 20).date(),
            warranty_expiry=datetime(2026, 3, 20).date(),
            location="Warehouse Bay 1",
            department_id=UUID("44444444-4444-4444-4444-444444444444"),
            assigned_employee="Warehouse Staff",
            maintenance_team_id=UUID("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            status=EquipmentStatus.active
        ),
        
        # Scrapped Equipment
        Equipment(
            id=UUID("e0000000-0000-0000-0000-000000000099"),
            name="Old Server Dell R720",
            serial_number="SRV-2015-099",
            category="Server",
            purchase_date=datetime(2015, 1, 10).date(),
            warranty_expiry=datetime(2018, 1, 10).date(),
            location="Storage Room",
            department_id=UUID("11111111-1111-1111-1111-111111111111"),
            assigned_employee=None,
            maintenance_team_id=UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            status=EquipmentStatus.scrapped
        ),
    ]
    
    db.add_all(equipment_list)
    db.commit()
    print(f"✅ Added {len(equipment_list)} equipment items")


def seed_maintenance_requests(db: SessionLocal):
    """Seed maintenance requests."""
    print("📋 Seeding maintenance requests...")
    
    # Calculate dates relative to today
    now = datetime.now()
    yesterday = now - timedelta(days=1)
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)
    tomorrow = now + timedelta(days=1)
    in_three_days = now + timedelta(days=3)
    next_week = now + timedelta(days=7)
    
    requests = [
        # Active Corrective Requests
        MaintenanceRequest(
            id=UUID("a0000000-0000-0000-0000-000000000001"),
            subject="Server not responding",
            description="Dell Server R740 is not responding to ping. System appears to be down.",
            request_type=RequestType.corrective,
            equipment_id=UUID("e0000000-0000-0000-0000-000000000001"),
            detected_by=UUID("00000000-0000-0000-0000-000000000020"),
            assigned_to=UUID("10000000-0000-0000-0000-000000000001"),
            scheduled_date=None,
            overdue=False,
            stage=RequestStage.in_progress,
            
            created_at=yesterday
        ),
        MaintenanceRequest(
            id=UUID("a0000000-0000-0000-0000-000000000002"),
            subject="CNC machine unusual noise",
            description="CNC Machine making grinding noise during operation. Needs inspection.",
            request_type=RequestType.corrective,
            equipment_id=UUID("e0000000-0000-0000-0000-000000000010"),
            detected_by=UUID("00000000-0000-0000-0000-000000000021"),
            assigned_to=UUID("10000000-0000-0000-0000-000000000002"),
            scheduled_date=None,
            overdue=False,
            stage=RequestStage.new,
            
            created_at=now
        ),
        MaintenanceRequest(
            id=UUID("a0000000-0000-0000-0000-000000000003"),
            subject="Elevator door malfunction",
            description="Elevator doors not closing properly on Floor 3.",
            request_type=RequestType.corrective,
            equipment_id=UUID("e0000000-0000-0000-0000-000000000022"),
            detected_by=UUID("00000000-0000-0000-0000-000000000022"),
            assigned_to=UUID("10000000-0000-0000-0000-000000000003"),
            scheduled_date=None,
            overdue=False,
            stage=RequestStage.new,
            
            created_at=now
        ),
        
        # Preventive Maintenance Requests
        MaintenanceRequest(
            id=UUID("a0000000-0000-0000-0000-000000000010"),
            subject="Quarterly server maintenance",
            description="Scheduled quarterly maintenance for server room equipment.",
            request_type=RequestType.preventive,
            equipment_id=UUID("e0000000-0000-0000-0000-000000000001"),
            detected_by=UUID("00000000-0000-0000-0000-000000000002"),
            assigned_to=UUID("10000000-0000-0000-0000-000000000001"),
            scheduled_date=in_three_days.date(),
            stage=RequestStage.new,
            
            created_at=week_ago
        ),
        MaintenanceRequest(
            id=UUID("a0000000-0000-0000-0000-000000000011"),
            subject="HVAC annual inspection",
            description="Annual inspection and filter replacement for HVAC system.",
            request_type=RequestType.preventive,
            equipment_id=UUID("e0000000-0000-0000-0000-000000000020"),
            detected_by=UUID("00000000-0000-0000-0000-000000000003"),
            assigned_to=UUID("10000000-0000-0000-0000-000000000003"),
            scheduled_date=tomorrow.date(),
            stage=RequestStage.new,
            
            created_at=two_weeks_ago
        ),
        MaintenanceRequest(
            id=UUID("a0000000-0000-0000-0000-000000000012"),
            subject="Forklift monthly service",
            description="Monthly service check for forklift - oil, brakes, hydraulics.",
            request_type=RequestType.preventive,
            equipment_id=UUID("e0000000-0000-0000-0000-000000000030"),
            detected_by=UUID("00000000-0000-0000-0000-000000000002"),
            assigned_to=UUID("10000000-0000-0000-0000-000000000004"),
            scheduled_date=next_week.date(),
            stage=RequestStage.new,
            
            created_at=two_weeks_ago
        ),
        
        # Completed Requests
        MaintenanceRequest(
            id=UUID("a0000000-0000-0000-0000-000000000020"),
            subject="Network switch firmware update",
            description="Update firmware to latest version for security patches.",
            request_type=RequestType.preventive,
            equipment_id=UUID("e0000000-0000-0000-0000-000000000002"),
            detected_by=UUID("00000000-0000-0000-0000-000000000002"),
            assigned_to=UUID("10000000-0000-0000-0000-000000000001"),
            scheduled_date=week_ago.date(),
            stage=RequestStage.repaired,
            
            created_at=two_weeks_ago,
        ),
        MaintenanceRequest(
            id=UUID("a0000000-0000-0000-0000-000000000021"),
            subject="Conveyor belt replacement",
            description="Replace worn conveyor belt on assembly line.",
            request_type=RequestType.corrective,
            equipment_id=UUID("e0000000-0000-0000-0000-000000000012"),
            detected_by=UUID("00000000-0000-0000-0000-000000000021"),
            assigned_to=UUID("10000000-0000-0000-0000-000000000002"),
            scheduled_date=None,
            overdue=False,
            stage=RequestStage.repaired,
            
            created_at=two_weeks_ago,
        ),
    ]
    
    db.add_all(requests)
    db.commit()
    print(f"✅ Added {len(requests)} maintenance requests")


def seed_time_logs(db: SessionLocal):
    """Seed time logs."""
    print("⏱️  Seeding time logs...")
    
    logs = [
        TimeLog(
            request_id=UUID("a0000000-0000-0000-0000-000000000001"),
            technician_id=UUID("10000000-0000-0000-0000-000000000001"),
            hours_spent=3.5,
            logged_at=datetime.now() - timedelta(hours=4)
        ),
        TimeLog(
            request_id=UUID("a0000000-0000-0000-0000-000000000020"),
            technician_id=UUID("10000000-0000-0000-0000-000000000001"),
            hours_spent=2.0,
            logged_at=datetime.now() - timedelta(days=7)
        ),
        TimeLog(
            request_id=UUID("a0000000-0000-0000-0000-000000000021"),
            technician_id=UUID("10000000-0000-0000-0000-000000000002"),
            hours_spent=4.5,
            logged_at=datetime.now() - timedelta(days=14)
        ),
        TimeLog(
            request_id=UUID("a0000000-0000-0000-0000-000000000021"),
            technician_id=UUID("10000000-0000-0000-0000-000000000002"),
            hours_spent=3.0,
            logged_at=datetime.now() - timedelta(days=13)
        ),
    ]
    
    db.add_all(logs)
    db.commit()
    print(f"✅ Added {len(logs)} time logs")


def seed_audit_logs(db: SessionLocal):
    """Seed request audit logs."""
    print("📝 Seeding audit logs...")
    
    audit_logs = [
        RequestAuditLog(
            request_id=UUID("a0000000-0000-0000-0000-000000000001"),
            changed_by=UUID("00000000-0000-0000-0000-000000000020"),
            old_stage=None,
            new_stage=RequestStage.new,
            changed_at=datetime.now() - timedelta(days=1)
        ),
        RequestAuditLog(
            request_id=UUID("a0000000-0000-0000-0000-000000000001"),
            changed_by=UUID("00000000-0000-0000-0000-000000000010"),
            old_stage=RequestStage.new,
            new_stage=RequestStage.in_progress,
            changed_at=datetime.now() - timedelta(hours=20)
        ),
        RequestAuditLog(
            request_id=UUID("a0000000-0000-0000-0000-000000000020"),
            changed_by=UUID("00000000-0000-0000-0000-000000000002"),
            old_stage=None,
            new_stage=RequestStage.new,
            changed_at=datetime.now() - timedelta(days=14)
        ),
        RequestAuditLog(
            request_id=UUID("a0000000-0000-0000-0000-000000000020"),
            changed_by=UUID("00000000-0000-0000-0000-000000000010"),
            old_stage=RequestStage.new,
            new_stage=RequestStage.repaired,
            changed_at=datetime.now() - timedelta(days=7)
        ),
    ]
    
    db.add_all(audit_logs)
    db.commit()
    print(f"✅ Added {len(audit_logs)} audit logs")


def main():
    """Main seeding function."""
    print("=" * 60)
    print("🌱 GearGuard Database Seeding Script")
    print("=" * 60)
    
    try:
        # Create database session
        db = SessionLocal()
        
        # Run seeding operations
        clear_data(db)
        seed_departments(db)
        seed_maintenance_teams(db)
        seed_users(db)
        seed_technicians(db)
        seed_equipment(db)
        seed_maintenance_requests(db)
        seed_time_logs(db)
        seed_audit_logs(db)
        
        print("\n" + "=" * 60)
        print("✅ Database seeded successfully!")
        print("=" * 60)
        print("\n📌 Test Account Credentials:")
        print("   Email: alice.admin@gearguard.com")
        print("   Password: password123")
        print("   Role: admin")
        print("\n   Other accounts:")
        print("   - bob.manager@gearguard.com (manager)")
        print("   - dave.tech@gearguard.com (technician)")
        print("   - henry.user@gearguard.com (user)")
        print("   All use password: password123")
        print("\n🚀 You can now login at http://localhost:8000/api/docs")
        print("=" * 60)
        
        db.close()
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
