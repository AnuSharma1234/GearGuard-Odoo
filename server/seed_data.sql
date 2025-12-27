-- Seed Data for GearGuard Database
-- Run this after the schema is applied to populate with test data

BEGIN;

-- Clear existing data (in correct order to respect foreign keys)
DELETE FROM time_logs;
DELETE FROM request_audit_logs;
DELETE FROM maintenance_requests;
DELETE FROM equipment;
DELETE FROM technicians;
DELETE FROM maintenance_teams;
DELETE FROM departments;
DELETE FROM users;

-- Insert Departments
INSERT INTO departments (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'IT', 'Information Technology Department'),
  ('22222222-2222-2222-2222-222222222222', 'Manufacturing', 'Production and Manufacturing'),
  ('33333333-3333-3333-3333-333333333333', 'Facilities', 'Building Maintenance and Operations'),
  ('44444444-4444-4444-4444-444444444444', 'Warehouse', 'Inventory and Logistics');

-- Insert Maintenance Teams
INSERT INTO maintenance_teams (id, name, specialization) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'IT Support', 'Computer and Network Equipment'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mechanical Team', 'Industrial Machinery'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Building Maintenance', 'HVAC and Electrical Systems'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Material Handling', 'Forklifts and Conveyors');

-- Insert Users
-- Note: In production, use proper password hashing (bcrypt, argon2, etc.)
-- These are placeholder hashes - replace with actual hashed passwords
INSERT INTO users (id, name, email, role, password_hash, is_active) VALUES
  -- Admin
  ('00000000-0000-0000-0000-000000000001', 'Alice Admin', 'alice.admin@gearguard.com', 'admin', '$2b$12$placeholder_hash_admin', true),
  
  -- Managers
  ('00000000-0000-0000-0000-000000000002', 'Bob Manager', 'bob.manager@gearguard.com', 'manager', '$2b$12$placeholder_hash_manager', true),
  ('00000000-0000-0000-0000-000000000003', 'Carol Manager', 'carol.manager@gearguard.com', 'manager', '$2b$12$placeholder_hash_manager2', true),
  
  -- Technicians
  ('00000000-0000-0000-0000-000000000010', 'Dave Technician', 'dave.tech@gearguard.com', 'technician', '$2b$12$placeholder_hash_tech1', true),
  ('00000000-0000-0000-0000-000000000011', 'Eve Technician', 'eve.tech@gearguard.com', 'technician', '$2b$12$placeholder_hash_tech2', true),
  ('00000000-0000-0000-0000-000000000012', 'Frank Technician', 'frank.tech@gearguard.com', 'technician', '$2b$12$placeholder_hash_tech3', true),
  ('00000000-0000-0000-0000-000000000013', 'Grace Technician', 'grace.tech@gearguard.com', 'technician', '$2b$12$placeholder_hash_tech4', true),
  
  -- Regular Users
  ('00000000-0000-0000-0000-000000000020', 'Henry User', 'henry.user@gearguard.com', 'user', '$2b$12$placeholder_hash_user1', true),
  ('00000000-0000-0000-0000-000000000021', 'Iris User', 'iris.user@gearguard.com', 'user', '$2b$12$placeholder_hash_user2', true),
  ('00000000-0000-0000-0000-000000000022', 'Jack User', 'jack.user@gearguard.com', 'user', '$2b$12$placeholder_hash_user3', true);

-- Insert Technicians (mapping to technician users)
INSERT INTO technicians (id, user_id, team_id, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true),  -- Dave -> IT Support
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true),  -- Eve -> Mechanical
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true),  -- Frank -> Building
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000013', 'dddddddd-dddd-dddd-dddd-dddddddddddd', true);  -- Grace -> Material Handling

-- Insert Equipment
INSERT INTO equipment (id, name, serial_number, category, purchase_date, warranty_expiry, location, department_id, assigned_employee, maintenance_team_id, status) VALUES
  -- IT Equipment
  ('e0000000-0000-0000-0000-000000000001', 'Dell Server R740', 'SRV-2024-001', 'Server', '2024-01-15', '2027-01-15', 'Server Room A', '11111111-1111-1111-1111-111111111111', 'IT Department', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'active'),
  ('e0000000-0000-0000-0000-000000000002', 'Network Switch Cisco 3850', 'NET-2023-042', 'Network', '2023-06-20', '2026-06-20', 'Network Closet B2', '11111111-1111-1111-1111-111111111111', 'IT Department', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'active'),
  ('e0000000-0000-0000-0000-000000000003', 'Backup Storage NAS', 'STO-2022-015', 'Storage', '2022-03-10', '2025-03-10', 'Server Room A', '11111111-1111-1111-1111-111111111111', 'IT Department', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'active'),
  
  -- Manufacturing Equipment
  ('e0000000-0000-0000-0000-000000000010', 'CNC Machine Model X500', 'CNC-2020-088', 'Machinery', '2020-08-15', '2025-08-15', 'Manufacturing Floor 1', '22222222-2222-2222-2222-222222222222', 'Production Team', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'active'),
  ('e0000000-0000-0000-0000-000000000011', 'Industrial Press 50T', 'PRS-2019-023', 'Machinery', '2019-05-20', '2024-05-20', 'Manufacturing Floor 2', '22222222-2222-2222-2222-222222222222', 'Production Team', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'active'),
  ('e0000000-0000-0000-0000-000000000012', 'Assembly Line Conveyor', 'CNV-2021-047', 'Conveyor', '2021-11-10', '2026-11-10', 'Assembly Area', '22222222-2222-2222-2222-222222222222', 'Production Team', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'active'),
  
  -- Facilities Equipment
  ('e0000000-0000-0000-0000-000000000020', 'HVAC Unit Carrier 50T', 'HVAC-2018-012', 'HVAC', '2018-04-15', '2023-04-15', 'Roof Building A', '33333333-3333-3333-3333-333333333333', 'Facilities', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'active'),
  ('e0000000-0000-0000-0000-000000000021', 'Emergency Generator 200kW', 'GEN-2020-003', 'Generator', '2020-02-10', '2025-02-10', 'Equipment Yard', '33333333-3333-3333-3333-333333333333', 'Facilities', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'active'),
  ('e0000000-0000-0000-0000-000000000022', 'Elevator System Otis', 'ELV-2015-008', 'Elevator', '2015-09-20', '2020-09-20', 'Building A Main', '33333333-3333-3333-3333-333333333333', 'Facilities', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'active'),
  
  -- Warehouse Equipment
  ('e0000000-0000-0000-0000-000000000030', 'Forklift Toyota 8FGU25', 'FLT-2022-034', 'Forklift', '2022-07-15', '2027-07-15', 'Warehouse Bay 3', '44444444-4444-4444-4444-444444444444', 'Warehouse Staff', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'active'),
  ('e0000000-0000-0000-0000-000000000031', 'Pallet Jack Electric', 'PLJ-2023-012', 'Pallet Jack', '2023-03-20', '2026-03-20', 'Warehouse Bay 1', '44444444-4444-4444-4444-444444444444', 'Warehouse Staff', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'active'),
  
  -- Scrapped Equipment (for testing)
  ('e0000000-0000-0000-0000-000000000099', 'Old Server Dell R720', 'SRV-2015-099', 'Server', '2015-01-10', '2018-01-10', 'Storage Room', '11111111-1111-1111-1111-111111111111', NULL, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'scrapped');

-- Insert Maintenance Requests
INSERT INTO maintenance_requests (id, subject, description, request_type, equipment_id, detected_by, assigned_to, scheduled_date, stage, overdue, created_at) VALUES
  -- Active Corrective Requests
  ('a0000000-0000-0000-0000-000000000001', 'Server not responding', 'Dell Server R740 is not responding to ping. System appears to be down.', 'corrective', 'e0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000001', NULL, 'in_progress', false, '2025-12-26 09:30:00'),
  ('a0000000-0000-0000-0000-000000000002', 'CNC machine unusual noise', 'CNC Machine making grinding noise during operation. Needs inspection.', 'corrective', 'e0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000002', NULL, 'new', false, '2025-12-27 08:15:00'),
  ('a0000000-0000-0000-0000-000000000003', 'Elevator door malfunction', 'Elevator doors not closing properly on Floor 3.', 'corrective', 'e0000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000003', NULL, 'new', false, '2025-12-27 10:00:00'),
  
  -- Preventive Maintenance Requests
  ('a0000000-0000-0000-0000-000000000010', 'Quarterly server maintenance', 'Scheduled quarterly maintenance for server room equipment.', 'preventive', 'e0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '2025-12-30', 'new', false, '2025-12-20 14:00:00'),
  ('a0000000-0000-0000-0000-000000000011', 'HVAC annual inspection', 'Annual inspection and filter replacement for HVAC system.', 'preventive', 'e0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '2025-12-28', 'new', false, '2025-12-15 10:00:00'),
  ('a0000000-0000-0000-0000-000000000012', 'Forklift monthly service', 'Monthly service check for forklift - oil, brakes, hydraulics.', 'preventive', 'e0000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', '2026-01-05', 'new', false, '2025-12-25 16:00:00'),
  
  -- Completed Requests
  ('a0000000-0000-0000-0000-000000000020', 'Network switch firmware update', 'Update firmware to latest version for security patches.', 'preventive', 'e0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '2025-12-20', 'repaired', false, '2025-12-15 09:00:00'),
  ('a0000000-0000-0000-0000-000000000021', 'Conveyor belt replacement', 'Replace worn conveyor belt on assembly line.', 'corrective', 'e0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000002', NULL, 'repaired', false, '2025-12-10 11:30:00');

-- Insert Time Logs
INSERT INTO time_logs (request_id, technician_id, hours_spent, logged_at) VALUES
  -- Server issue (in progress)
  ('a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 2.5, '2025-12-26 10:00:00'),
  ('a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1.75, '2025-12-26 14:30:00'),
  
  -- Completed network switch update
  ('a0000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000001', 3.0, '2025-12-20 10:00:00'),
  ('a0000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000001', 1.5, '2025-12-20 15:00:00'),
  
  -- Completed conveyor belt replacement
  ('a0000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000002', 4.0, '2025-12-10 12:00:00'),
  ('a0000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000002', 3.5, '2025-12-11 09:00:00');

-- Insert Request Audit Logs
INSERT INTO request_audit_logs (request_id, old_stage, new_stage, changed_by, changed_at) VALUES
  -- Server issue progress
  ('a0000000-0000-0000-0000-000000000001', NULL, 'new', '00000000-0000-0000-0000-000000000020', '2025-12-26 09:30:00'),
  ('a0000000-0000-0000-0000-000000000001', 'new', 'in_progress', '00000000-0000-0000-0000-000000000010', '2025-12-26 09:45:00'),
  
  -- Network switch update completion
  ('a0000000-0000-0000-0000-000000000020', NULL, 'new', '00000000-0000-0000-0000-000000000002', '2025-12-15 09:00:00'),
  ('a0000000-0000-0000-0000-000000000020', 'new', 'in_progress', '00000000-0000-0000-0000-000000000010', '2025-12-20 09:30:00'),
  ('a0000000-0000-0000-0000-000000000020', 'in_progress', 'repaired', '00000000-0000-0000-0000-000000000010', '2025-12-20 16:45:00'),
  
  -- Conveyor belt replacement completion
  ('a0000000-0000-0000-0000-000000000021', NULL, 'new', '00000000-0000-0000-0000-000000000021', '2025-12-10 11:30:00'),
  ('a0000000-0000-0000-0000-000000000021', 'new', 'in_progress', '00000000-0000-0000-0000-000000000011', '2025-12-10 11:45:00'),
  ('a0000000-0000-0000-0000-000000000021', 'in_progress', 'repaired', '00000000-0000-0000-0000-000000000011', '2025-12-11 14:30:00');

COMMIT;

-- Display summary
SELECT 'Seed data inserted successfully!' AS status;
SELECT 'Total records:' AS info;
SELECT 'Users' AS table_name, COUNT(*) AS count FROM users
UNION ALL SELECT 'Departments', COUNT(*) FROM departments
UNION ALL SELECT 'Maintenance Teams', COUNT(*) FROM maintenance_teams
UNION ALL SELECT 'Technicians', COUNT(*) FROM technicians
UNION ALL SELECT 'Equipment', COUNT(*) FROM equipment
UNION ALL SELECT 'Maintenance Requests', COUNT(*) FROM maintenance_requests
UNION ALL SELECT 'Time Logs', COUNT(*) FROM time_logs
UNION ALL SELECT 'Audit Logs', COUNT(*) FROM request_audit_logs;
