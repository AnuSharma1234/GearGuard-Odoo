# GearGuard Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GEARGUARD DATABASE SCHEMA                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│     USERS        │
├──────────────────┤
│ • id (PK)        │
│ • name           │
│ • email (unique) │◄────────┐
│ • role (enum)    │         │
│ • password_hash  │         │
│ • is_active      │         │
│ • created_at     │         │
└──────────────────┘         │
         │                   │
         │ 1:1               │
         ▼                   │
┌──────────────────┐         │
│  TECHNICIANS     │         │
├──────────────────┤         │
│ • id (PK)        │         │
│ • user_id (FK)   │─────────┘
│ • team_id (FK)   │─────────┐
│ • is_active      │         │
└──────────────────┘         │
         │                   │
         │ many              │
         │                   │ many:1
         ▼                   ▼
┌──────────────────┐   ┌──────────────────────┐
│   TIME_LOGS      │   │ MAINTENANCE_TEAMS    │
├──────────────────┤   ├──────────────────────┤
│ • id (PK)        │   │ • id (PK)            │
│ • request_id(FK) │   │ • name (unique)      │
│ • technician_id  │   │ • specialization     │
│ • hours_spent    │   └──────────────────────┘
│ • logged_at      │            │
└──────────────────┘            │ 1:many
         │                      ▼
         │                ┌──────────────────────┐
         │                │     EQUIPMENT        │
         │                ├──────────────────────┤
         │                │ • id (PK)            │
         │                │ • name               │
         │                │ • serial_number      │
         │                │ • category           │
         │                │ • purchase_date      │
         │                │ • warranty_expiry    │
         │                │ • location           │
         │        ┌───────│ • department_id (FK) │
         │        │       │ • assigned_employee  │
         │        │       │ • maintenance_team_id│
         │        │       │ • status (enum)      │
         │        │       └──────────────────────┘
         │        │                │
         │        │                │ 1:many
         │        │                ▼
         │        │       ┌──────────────────────────┐
         │        │       │ MAINTENANCE_REQUESTS     │
         │        │       ├──────────────────────────┤
         │        │       │ • id (PK)                │
         │        └──────►│ • subject                │
         │                │ • description            │
         │                │ • request_type (enum)    │
         │                │ • equipment_id (FK)      │
         │                │ • detected_by (FK)       │───┐
         └───────────────►│ • assigned_to (FK)       │   │
                          │ • scheduled_date         │   │
                          │ • stage (enum)           │   │
                          │ • overdue                │   │
                          │ • created_at             │   │
                          └──────────────────────────┘   │
                                   │                     │
                                   │ 1:many              │
                                   ▼                     │
                          ┌──────────────────────────┐   │
                          │ REQUEST_AUDIT_LOGS       │   │
                          ├──────────────────────────┤   │
                          │ • id (PK)                │   │
                          │ • request_id (FK)        │   │
                          │ • old_stage              │   │
                          │ • new_stage              │   │
                          │ • changed_by (FK)        │───┘
                          │ • changed_at             │
                          └──────────────────────────┘

┌──────────────────┐
│  DEPARTMENTS     │
├──────────────────┤
│ • id (PK)        │
│ • name (unique)  │─────┐
│ • description    │     │ 1:many
└──────────────────┘     │
                         └───► (to EQUIPMENT)


╔════════════════════════════════════════════════════════════════════╗
║                            ENUM TYPES                               ║
╠════════════════════════════════════════════════════════════════════╣
║  user_role          │ admin, manager, technician, user             ║
║  equipment_status   │ active, scrapped                             ║
║  request_type       │ corrective, preventive                       ║
║  request_stage      │ new, in_progress, repaired, scrap            ║
╚════════════════════════════════════════════════════════════════════╝


╔════════════════════════════════════════════════════════════════════╗
║                         KEY CONSTRAINTS                             ║
╠════════════════════════════════════════════════════════════════════╣
║  • warranty_expiry >= purchase_date (equipment)                    ║
║  • preventive requests MUST have scheduled_date                    ║
║  • hours_spent > 0 (time_logs)                                     ║
║  • one user can be only one technician (technicians.user_id unique)║
║  • email must be unique (users)                                    ║
║  • serial_number must be unique (equipment)                        ║
╚════════════════════════════════════════════════════════════════════╝


╔════════════════════════════════════════════════════════════════════╗
║                      PERFORMANCE INDEXES                            ║
╠════════════════════════════════════════════════════════════════════╣
║  • idx_requests_stage           (maintenance_requests.stage)       ║
║  • idx_requests_equipment       (maintenance_requests.equipment_id)║
║  • idx_requests_assigned_to     (maintenance_requests.assigned_to) ║
║  • idx_equipment_team           (equipment.maintenance_team_id)    ║
║  • idx_users_email              (users.email)                      ║
║  • idx_users_role               (users.role)                       ║
║  • idx_technicians_user         (technicians.user_id)              ║
║  • idx_time_logs_request        (time_logs.request_id)             ║
║  • idx_time_logs_technician     (time_logs.technician_id)          ║
╚════════════════════════════════════════════════════════════════════╝
```

## Relationships Summary

### One-to-One
- **users** ↔ **technicians**: Each technician must be a user

### One-to-Many
- **departments** → **equipment**: Each department has many equipment items
- **maintenance_teams** → **equipment**: Each team maintains many equipment items
- **maintenance_teams** → **technicians**: Each team has many technicians
- **equipment** → **maintenance_requests**: Each equipment item can have many requests
- **users** → **maintenance_requests** (detected_by): Each user can create many requests
- **technicians** → **maintenance_requests** (assigned_to): Each technician can be assigned many requests
- **maintenance_requests** → **time_logs**: Each request can have many time log entries
- **technicians** → **time_logs**: Each technician can log time on many requests
- **maintenance_requests** → **request_audit_logs**: Each request has change history
- **users** → **request_audit_logs** (changed_by): Each user can make many changes

## Cascade Behaviors

### ON DELETE CASCADE
- Delete user → delete technician profile
- Delete equipment → delete associated maintenance requests
- Delete maintenance request → delete time logs and audit logs

### ON DELETE RESTRICT
- Cannot delete department if equipment exists
- Cannot delete maintenance team if equipment or technicians exist
- Cannot delete user if they detected requests or made audit changes
- Cannot delete technician if they have time logs

### ON DELETE SET NULL
- Delete technician → unassign from maintenance requests (assigned_to becomes NULL)
