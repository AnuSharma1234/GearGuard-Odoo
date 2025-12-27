# Database Schema

The GearGuard database schema is designed for a maintenance management system tracking equipment, maintenance requests, technicians, and time logs.

## Overview

The schema includes:
- **Users & Authentication**: Role-based user system (admin, manager, technician, user)
- **Equipment Management**: Track equipment with departments, teams, and status
- **Maintenance Requests**: Handle corrective and preventive maintenance
- **Time Tracking**: Log technician hours on maintenance tasks
- **Audit Logs**: Track stage changes in maintenance requests

## Quick Start

### For New Database

When you start the containers for the first time with a fresh database, the schema will be applied automatically:

```bash
docker-compose up -d
```

The `init.sql` file is mounted to `/docker-entrypoint-initdb.d/` and will run automatically on first startup.

### For Existing Database

If you need to apply the schema to an existing database:

```bash
./apply-schema.sh
```

Or manually:

```bash
docker exec -i gearguard-db psql -U gearguard -d gearguard_db < init.sql
```

### Reset Database

To completely reset the database:

```bash
# Stop and remove containers
docker-compose down

# Remove database data
sudo rm -rf postgres_data/pgdata

# Start fresh
docker-compose up -d
```

## Schema Structure

### Tables

1. **users** - System users with roles and authentication
2. **departments** - Organizational departments
3. **maintenance_teams** - Teams responsible for equipment maintenance
4. **technicians** - Technician profiles linked to users and teams
5. **equipment** - Equipment/assets being maintained
6. **maintenance_requests** - Maintenance work orders
7. **time_logs** - Time tracking for maintenance work
8. **request_audit_logs** - History of request stage changes

### Enums

- `user_role`: admin, manager, technician, user
- `equipment_status`: active, scrapped
- `request_type`: corrective, preventive
- `request_stage`: new, in_progress, repaired, scrap

### Key Relationships

```
users (1) ──→ (1) technicians ──→ (many) time_logs
                    ↓
              maintenance_teams
                    ↓
              equipment ──→ (many) maintenance_requests
                                        ↓
                                   time_logs
```

### Constraints

- **Technicians**: Must have unique user_id (one user = one technician)
- **Equipment**: warranty_expiry must be >= purchase_date
- **Preventive Maintenance**: Must have scheduled_date
- **Time Logs**: hours_spent must be > 0

## Database Access

### Via Docker

```bash
# Connect to PostgreSQL
docker exec -it gearguard-db psql -U gearguard -d gearguard_db

# List tables
\dt

# Describe a table
\d users

# List enums
\dT

# Exit
\q
```

### Environment Variables

Configure in `.env`:

```env
POSTGRES_USER=gearguard
POSTGRES_PASSWORD=gearguard123
POSTGRES_DB=gearguard_db
POSTGRES_PORT=5432
```

## Indexes

Performance indexes are created on:
- `maintenance_requests`: stage, equipment_id, assigned_to
- `equipment`: maintenance_team_id
- `users`: email, role
- `technicians`: user_id
- `time_logs`: request_id, technician_id

## Schema File

The complete schema is in [`init.sql`](init.sql) with:
- Extensions (uuid-ossp)
- Custom types (ENUMs)
- Tables with foreign keys
- Constraints and validations
- Performance indexes
