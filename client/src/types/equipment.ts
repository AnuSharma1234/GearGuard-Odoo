export interface Equipment {
  id: string; // UUID
  name: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  department_id?: string; // UUID
  location?: string;
  status: EquipmentStatus;
  purchase_date?: string; // ISO date
  warranty_expiry?: string; // ISO date
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export type EquipmentStatus = 'operational' | 'maintenance' | 'out_of_service' | 'scrapped';

