export type UserRole = 'user' | 'technician' | 'manager' | 'admin';

export interface User {
  id: string; // UUID
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string; // ISO datetime
}

export interface Department {
  id: string; // UUID
  name: string;
  description?: string;
  created_at: string;
}

export interface MaintenanceTeam {
  id: string; // UUID
  name: string;
  department_id: string; // UUID
  created_at: string;
}

export interface Technician {
  id: string; // UUID
  user_id: string; // UUID (references users)
  team_id?: string; // UUID (references maintenance_teams)
  specialization?: string;
  created_at: string;
}

