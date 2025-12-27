# GearGuard Database - Quick Reference

## 🚀 Quick Start Commands

```bash
# First time setup
./setup.sh

# Apply schema to existing database
./apply-schema.sh

# Load test data
./seed.sh

# Reset everything
docker-compose down && sudo rm -rf postgres_data/pgdata && docker-compose up -d
```

## 📊 Database Access

```bash
# Connect to database
docker exec -it gearguard-db psql -U gearguard_user -d gearguard_db

# Inside psql:
\dt              # List tables
\d users         # Describe table
\dT              # List custom types/enums
\q               # Exit
```

## 📋 Tables

| Table | Description | Key Fields |
|-------|-------------|-----------|
| `users` | System users | id, email, role, password_hash |
| `departments` | Organizational units | id, name |
| `maintenance_teams` | Service teams | id, name, specialization |
| `technicians` | Tech profiles | id, user_id, team_id |
| `equipment` | Assets/devices | id, serial_number, status |
| `maintenance_requests` | Work orders | id, type, stage, equipment_id |
| `time_logs` | Time tracking | id, request_id, hours_spent |
| `request_audit_logs` | Change history | id, request_id, old_stage, new_stage |

## 🏷️ Enums

```sql
user_role:         'admin' | 'manager' | 'technician' | 'user'
equipment_status:  'active' | 'scrapped'
request_type:      'corrective' | 'preventive'
request_stage:     'new' | 'in_progress' | 'repaired' | 'scrap'
```

## 🔗 Key Relationships

```
users (1:1) ↔ technicians (many:1) → maintenance_teams
                ↓
departments → equipment → maintenance_requests
                ↓                ↓
         maintenance_teams   time_logs
                            audit_logs
```

## 💡 Common Queries

```sql
-- All active equipment
SELECT * FROM equipment WHERE status = 'active';

-- Open maintenance requests
SELECT * FROM maintenance_requests 
WHERE stage IN ('new', 'in_progress');

-- Total hours per technician
SELECT u.name, SUM(tl.hours_spent) AS total_hours
FROM technicians t
JOIN users u ON t.user_id = u.id
LEFT JOIN time_logs tl ON t.id = tl.technician_id
GROUP BY u.name;

-- Equipment with expiring warranties
SELECT name, warranty_expiry 
FROM equipment 
WHERE warranty_expiry BETWEEN NOW() AND NOW() + INTERVAL '90 days';
```

## 📁 Files

| File | Purpose |
|------|---------|
| `init.sql` | Database schema definition |
| `seed_data.sql` | Test data for development |
| `sample_queries.sql` | Example queries |
| `apply-schema.sh` | Apply schema script |
| `seed.sh` | Load seed data script |
| `DATABASE.md` | Full documentation |
| `SCHEMA_DIAGRAM.md` | Visual reference |

## 🧪 Test Data

After running `./seed.sh`, you'll have:
- 10 users (1 admin, 2 managers, 4 technicians, 3 users)
- 4 departments
- 4 maintenance teams
- 4 technicians
- 12 equipment items
- 8 maintenance requests
- 6 time logs
- 8 audit log entries

**Test Accounts:**
- Admin: alice.admin@gearguard.com
- Manager: bob.manager@gearguard.com  
- Technician: dave.tech@gearguard.com
- User: henry.user@gearguard.com

⚠️ **Note:** Password hashes are placeholders. Update with real bcrypt hashes!

## 🛠️ Maintenance

```bash
# Backup database
docker exec gearguard-db pg_dump -U gearguard_user gearguard_db > backup.sql

# Restore database
docker exec -i gearguard-db psql -U gearguard_user -d gearguard_db < backup.sql

# View database size
docker exec -i gearguard-db psql -U gearguard_user -d gearguard_db \
  -c "SELECT pg_size_pretty(pg_database_size('gearguard_db'));"

# List all connections
docker exec -i gearguard-db psql -U gearguard_user -d gearguard_db \
  -c "SELECT * FROM pg_stat_activity;"
```

## 📚 Documentation

- [DATABASE.md](DATABASE.md) - Full database docs
- [SCHEMA_DIAGRAM.md](SCHEMA_DIAGRAM.md) - Visual schema
- [SETUP_SUMMARY.md](SETUP_SUMMARY.md) - Setup completion
- [sample_queries.sql](sample_queries.sql) - Query examples
