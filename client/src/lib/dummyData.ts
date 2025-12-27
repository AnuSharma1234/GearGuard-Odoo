import { promises as fs } from 'fs';
import path from 'path';

// Typed loaders for dummy JSON data. These simulate API calls.
// They are read-only and safe to use in Server Components.

export type UserRole = 'admin' | 'manager' | 'technician' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Technician {
  id: string;
  user_id: string;
  team_id: string;
  is_active: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  category?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  location?: string;
  department_id?: string;
  assigned_employee?: string;
  maintenance_team_id: string;
  status: 'active' | 'scrapped';
}

export type RequestType = 'corrective' | 'preventive';
export type RequestStage = 'new' | 'in_progress' | 'repaired' | 'scrap';

export interface MaintenanceRequest {
  id: string;
  subject: string;
  description?: string;
  request_type: RequestType;
  equipment_id: string;
  detected_by: string; // users.id
  assigned_to?: string | null; // technicians.id
  scheduled_date?: string; // YYYY-MM-DD
  stage: RequestStage;
  overdue: boolean;
  created_at: string; // ISO datetime
}

export interface TimeLog {
  id: string;
  request_id: string;
  technician_id: string;
  hours_spent: number;
  logged_at: string;
}

async function readJson<T>(fileName: string): Promise<T> {
  const filePath = path.join(process.cwd(), 'data', fileName);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export async function getUsers(): Promise<User[]> {
  return readJson<User[]>('users.json');
}

export async function getEquipment(): Promise<Equipment[]> {
  return readJson<Equipment[]>('equipment.json');
}

export async function getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  return readJson<MaintenanceRequest[]>('maintenance_requests.json');
}

export async function getTechnicians(): Promise<Technician[]> {
  return readJson<Technician[]>('technicians.json');
}

export async function getTimeLogs(): Promise<TimeLog[]> {
  return readJson<TimeLog[]>('time_logs.json');
}

// Helper to join technician -> user for display name
export function resolveTechnicianName(
  technicianId: string | null | undefined,
  technicians: Technician[],
  users: User[]
): string {
  if (!technicianId) return 'Unassigned';
  const tech = technicians.find((t) => t.id === technicianId);
  if (!tech) return 'Unassigned';
  const user = users.find((u) => u.id === tech.user_id);
  return user?.name ?? 'Unassigned';
}
