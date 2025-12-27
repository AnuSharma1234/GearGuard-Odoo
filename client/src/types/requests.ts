export interface MaintenanceRequest {
  id: string; // UUID
  equipment_id: string; // UUID
  requested_by: string; // UUID (user_id)
  assigned_to?: string; // UUID (technician_id)
  title: string;
  description?: string;
  request_type: RequestType;
  priority: RequestPriority;
  stage: RequestStage;
  scheduled_date?: string; // ISO date (for preventive)
  completed_at?: string; // ISO datetime
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export type RequestType = 'corrective' | 'preventive';

export type RequestPriority = 'low' | 'medium' | 'high' | 'critical';

export type RequestStage = 'new' | 'in_progress' | 'repaired' | 'scrap';

export interface TimeLog {
  id: string; // UUID
  request_id: string; // UUID
  technician_id: string; // UUID
  hours_worked: number;
  description?: string;
  logged_at: string; // ISO datetime
  created_at: string; // ISO datetime
}

