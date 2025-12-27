-- Sample Queries for GearGuard Database
-- Useful queries for testing and development

-- ============================================
-- View Database Structure
-- ============================================

-- List all tables
\dt

-- List all custom types (enums)
\dT

-- Describe specific table
\d users
\d equipment
\d maintenance_requests

-- ============================================
-- Sample Data Insertion
-- ============================================

-- Insert departments
INSERT INTO departments (name, description) VALUES 
  ('IT', 'Information Technology Department'),
  ('Manufacturing', 'Production and Manufacturing'),
  ('Facilities', 'Building Maintenance and Operations');

-- Insert maintenance teams
INSERT INTO maintenance_teams (name, specialization) VALUES 
  ('IT Support', 'Computer and Network Equipment'),
  ('Mechanical Team', 'Industrial Machinery'),
  ('Building Maintenance', 'HVAC and Electrical Systems');

-- Insert sample users (note: password_hash should be properly hashed in production)
INSERT INTO users (name, email, role, password_hash) VALUES 
  ('Admin User', 'admin@gearguard.com', 'admin', 'hashed_password_here'),
  ('John Manager', 'john.manager@gearguard.com', 'manager', 'hashed_password_here'),
  ('Jane Tech', 'jane.tech@gearguard.com', 'technician', 'hashed_password_here'),
  ('Bob User', 'bob.user@gearguard.com', 'user', 'hashed_password_here');

-- ============================================
-- Useful Queries
-- ============================================

-- Get all active equipment with their departments and teams
SELECT 
  e.name AS equipment_name,
  e.serial_number,
  e.status,
  d.name AS department,
  mt.name AS maintenance_team
FROM equipment e
JOIN departments d ON e.department_id = d.id
JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
WHERE e.status = 'active'
ORDER BY e.name;

-- Get all open maintenance requests with assigned technicians
SELECT 
  mr.id,
  mr.subject,
  mr.request_type,
  mr.stage,
  e.name AS equipment_name,
  u_detected.name AS detected_by,
  u_tech.name AS assigned_technician,
  mr.scheduled_date,
  mr.created_at
FROM maintenance_requests mr
JOIN equipment e ON mr.equipment_id = e.id
JOIN users u_detected ON mr.detected_by = u_detected.id
LEFT JOIN technicians t ON mr.assigned_to = t.id
LEFT JOIN users u_tech ON t.user_id = u_tech.id
WHERE mr.stage IN ('new', 'in_progress')
ORDER BY mr.created_at DESC;

-- Get total hours spent per request
SELECT 
  mr.id AS request_id,
  mr.subject,
  SUM(tl.hours_spent) AS total_hours,
  COUNT(tl.id) AS log_entries
FROM maintenance_requests mr
LEFT JOIN time_logs tl ON mr.id = tl.request_id
GROUP BY mr.id, mr.subject
ORDER BY total_hours DESC;

-- Get technician workload (total hours logged)
SELECT 
  u.name AS technician_name,
  mt.name AS team,
  COUNT(DISTINCT tl.request_id) AS requests_worked,
  SUM(tl.hours_spent) AS total_hours
FROM technicians t
JOIN users u ON t.user_id = u.id
JOIN maintenance_teams mt ON t.team_id = mt.id
LEFT JOIN time_logs tl ON t.id = tl.technician_id
WHERE t.is_active = true
GROUP BY u.name, mt.name
ORDER BY total_hours DESC;

-- Get equipment with overdue maintenance
SELECT 
  e.name AS equipment_name,
  e.serial_number,
  mr.subject,
  mr.scheduled_date,
  mr.stage,
  CURRENT_DATE - mr.scheduled_date AS days_overdue
FROM equipment e
JOIN maintenance_requests mr ON e.id = mr.equipment_id
WHERE mr.overdue = true
  AND mr.stage NOT IN ('repaired', 'scrap')
ORDER BY days_overdue DESC;

-- Get audit history for a specific request
SELECT 
  ral.changed_at,
  ral.old_stage,
  ral.new_stage,
  u.name AS changed_by
FROM request_audit_logs ral
JOIN users u ON ral.changed_by = u.id
WHERE ral.request_id = 'REQUEST_ID_HERE'
ORDER BY ral.changed_at DESC;

-- Get equipment by department with maintenance stats
SELECT 
  d.name AS department,
  COUNT(e.id) AS total_equipment,
  SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) AS active_count,
  SUM(CASE WHEN e.status = 'scrapped' THEN 1 ELSE 0 END) AS scrapped_count
FROM departments d
LEFT JOIN equipment e ON d.id = e.department_id
GROUP BY d.name
ORDER BY total_equipment DESC;

-- Find equipment with expiring warranties (next 90 days)
SELECT 
  e.name,
  e.serial_number,
  e.warranty_expiry,
  e.warranty_expiry - CURRENT_DATE AS days_until_expiry,
  d.name AS department
FROM equipment e
JOIN departments d ON e.department_id = d.id
WHERE e.warranty_expiry BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
  AND e.status = 'active'
ORDER BY e.warranty_expiry;

-- Get preventive maintenance schedule
SELECT 
  mr.scheduled_date,
  mr.subject,
  e.name AS equipment_name,
  e.location,
  mt.name AS assigned_team,
  mr.stage
FROM maintenance_requests mr
JOIN equipment e ON mr.equipment_id = e.id
JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
WHERE mr.request_type = 'preventive'
  AND mr.scheduled_date >= CURRENT_DATE
  AND mr.stage != 'repaired'
ORDER BY mr.scheduled_date;

-- ============================================
-- Database Statistics
-- ============================================

-- Count records in each table
SELECT 
  'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'maintenance_teams', COUNT(*) FROM maintenance_teams
UNION ALL
SELECT 'technicians', COUNT(*) FROM technicians
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'maintenance_requests', COUNT(*) FROM maintenance_requests
UNION ALL
SELECT 'time_logs', COUNT(*) FROM time_logs
UNION ALL
SELECT 'request_audit_logs', COUNT(*) FROM request_audit_logs;
