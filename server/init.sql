-- ==============================================================================
-- GearGuard Database Schema Initialization
-- ==============================================================================
-- This file is automaticalsrc/app/dashboard/equipment/new/page.tsxly executed when the PostgreSQL container starts
-- for the first time.
-- ==============================================================================

-- 1️⃣ Extensions
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2️⃣ Enums
-- ==============================================================================
CREATE TYPE user_role AS ENUM (
  'admin',
  'manager',
  'technician',
  'user'
);

CREATE TYPE equipment_status AS ENUM (
  'active',
  'scrapped'
);

CREATE TYPE request_type AS ENUM (
  'corrective',
  'preventive'
);

CREATE TYPE request_stage AS ENUM (
  'new',
  'in_progress',
  'repaired',
  'scrap'
);

-- 3️⃣ Users
-- ==============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4️⃣ Departments
-- ==============================================================================
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

-- 5️⃣ Maintenance Teams
-- ==============================================================================
CREATE TABLE maintenance_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  specialization VARCHAR(100)
);

-- 6️⃣ Technicians
-- ==============================================================================
CREATE TABLE technicians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  team_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  CONSTRAINT fk_technician_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_technician_team
    FOREIGN KEY (team_id) REFERENCES maintenance_teams(id)
    ON DELETE RESTRICT
);

-- 7️⃣ Equipment
-- ==============================================================================
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  serial_number VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100),
  purchase_date DATE,
  warranty_expiry DATE,
  location VARCHAR(255),
  department_id UUID NOT NULL,
  assigned_employee VARCHAR(255),
  maintenance_team_id UUID NOT NULL,
  status equipment_status NOT NULL DEFAULT 'active',

  CONSTRAINT fk_equipment_department
    FOREIGN KEY (department_id) REFERENCES departments(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_equipment_team
    FOREIGN KEY (maintenance_team_id) REFERENCES maintenance_teams(id)
    ON DELETE RESTRICT,

  CONSTRAINT warranty_check
    CHECK (warranty_expiry IS NULL OR warranty_expiry >= purchase_date)
);

-- 8️⃣ Maintenance Requests
-- ==============================================================================
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  request_type request_type NOT NULL,
  equipment_id UUID NOT NULL,
  detected_by UUID NOT NULL,
  assigned_to UUID,
  scheduled_date DATE,
  stage request_stage NOT NULL DEFAULT 'new',
  overdue BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_request_equipment
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_request_detected_by
    FOREIGN KEY (detected_by) REFERENCES users(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_request_assigned_to
    FOREIGN KEY (assigned_to) REFERENCES technicians(id)
    ON DELETE SET NULL,

  CONSTRAINT preventive_schedule_check
    CHECK (
      (request_type = 'preventive' AND scheduled_date IS NOT NULL)
      OR
      (request_type = 'corrective')
    )
);

-- 9️⃣ Time Logs
-- ==============================================================================
CREATE TABLE time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL,
  technician_id UUID NOT NULL,
  hours_spent NUMERIC(5,2) NOT NULL CHECK (hours_spent > 0),
  logged_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_timelog_request
    FOREIGN KEY (request_id) REFERENCES maintenance_requests(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_timelog_technician
    FOREIGN KEY (technician_id) REFERENCES technicians(id)
    ON DELETE RESTRICT
);

-- 🔟 Audit / Stage History
-- ==============================================================================
CREATE TABLE request_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL,
  old_stage request_stage,
  new_stage request_stage NOT NULL,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_audit_request
    FOREIGN KEY (request_id) REFERENCES maintenance_requests(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_audit_user
    FOREIGN KEY (changed_by) REFERENCES users(id)
    ON DELETE RESTRICT
);

-- 11️⃣ Indexes (Performance)
-- ==============================================================================
CREATE INDEX idx_requests_stage ON maintenance_requests(stage);
CREATE INDEX idx_requests_equipment ON maintenance_requests(equipment_id);
CREATE INDEX idx_requests_assigned_to ON maintenance_requests(assigned_to);
CREATE INDEX idx_equipment_team ON equipment(maintenance_team_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_technicians_user ON technicians(user_id);
CREATE INDEX idx_time_logs_request ON time_logs(request_id);
CREATE INDEX idx_audit_logs_request ON request_audit_logs(request_id);

-- ==============================================================================
-- Database Schema Initialization Complete
-- ==============================================================================
