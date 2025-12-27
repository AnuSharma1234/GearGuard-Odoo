import usersData from '@/data/users.json';
import equipmentData from '@/data/equipment.json';
import maintenanceRequestsData from '@/data/maintenance_requests.json';
import techniciansData from '@/data/technicians.json';
import timeLogsData from '@/data/time_logs.json';
import departmentsData from '@/data/departments.json';
import maintenanceTeamsData from '@/data/maintenance_teams.json';
import { User } from '@/types/users';
import { Equipment } from '@/types/equipment';
import { MaintenanceRequest, TimeLog } from '@/types/requests';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock authentication token
const MOCK_TOKEN = 'mock-jwt-token-123456789';

// Transform JSON data to match our types
const transformEquipment = (item: any): Equipment => ({
  id: item.id,
  name: item.name,
  serial_number: item.serial_number,
  model: item.category, // Using category as model
  manufacturer: 'N/A',
  department_id: item.department_id,
  location: item.location,
  status: item.status === 'active' ? 'operational' : item.status === 'scrapped' ? 'scrapped' : 'out_of_service',
  purchase_date: item.purchase_date,
  warranty_expiry: item.warranty_expiry,
  created_at: '2025-01-15T10:30:00Z',
  updated_at: '2025-01-15T10:30:00Z',
});

const transformRequest = (item: any): MaintenanceRequest => ({
  id: item.id,
  equipment_id: item.equipment_id,
  requested_by: item.detected_by,
  assigned_to: item.assigned_to,
  title: item.subject,
  description: item.description,
  request_type: item.request_type,
  priority: item.overdue ? 'critical' : 'medium', // Derive priority from overdue
  stage: item.stage,
  scheduled_date: item.scheduled_date,
  completed_at: item.stage === 'repaired' ? '2025-12-19T16:00:00Z' : undefined,
  created_at: item.created_at,
  updated_at: item.created_at,
});

const transformTimeLog = (item: any): TimeLog => ({
  id: item.id,
  request_id: item.request_id,
  technician_id: item.technician_id,
  hours_worked: item.hours_spent,
  description: `Maintenance work - ${item.hours_spent} hours`,
  logged_at: item.logged_at,
  created_at: item.logged_at,
});

export const mockApi = {
  // Auth endpoints
  async login(email: string, password: string) {
    await delay(500);
    
    // Find user by email
    const user = usersData.find((u) => u.email === email);
    
    if (!user) {
      throw { response: { data: { detail: 'User not found' }, status: 404 } };
    }
    
    // In mock mode, accept any password
    return {
      access_token: MOCK_TOKEN,
      token_type: 'bearer',
    };
  },

  async register(data: { name: string; email: string; password: string }) {
    await delay(500);
    
    // Check if user already exists
    const exists = usersData.find((u) => u.email === data.email);
    
    if (exists) {
      throw { response: { data: { detail: 'Email already registered' }, status: 400 } };
    }
    
    return {
      access_token: MOCK_TOKEN,
      token_type: 'bearer',
    };
  },

  async getCurrentUser() {
    await delay(300);
    
    // Return first admin user as default logged-in user
    return usersData[0];
  },

  // Equipment endpoints
  async getEquipment() {
    await delay(400);
    return equipmentData.map(transformEquipment);
  },

  async getEquipmentById(id: string) {
    await delay(300);
    const item = equipmentData.find((e) => e.id === id);
    if (!item) {
      throw { response: { data: { detail: 'Equipment not found' }, status: 404 } };
    }
    return transformEquipment(item);
  },

  async getEquipmentMaintenanceRequests(equipmentId: string) {
    await delay(400);
    return maintenanceRequestsData
      .filter((r) => r.equipment_id === equipmentId)
      .map(transformRequest);
  },

  // Maintenance Request endpoints
  async getMaintenanceRequests(params?: any) {
    await delay(400);
    let requests = maintenanceRequestsData;
    
    if (params?.type) {
      requests = requests.filter((r) => r.request_type === params.type);
    }
    
    if (params?.stage) {
      requests = requests.filter((r) => r.stage === params.stage);
    }
    
    if (params?.equipment_id) {
      requests = requests.filter((r) => r.equipment_id === params.equipment_id);
    }
    
    return requests.map(transformRequest);
  },

  async getMaintenanceRequestById(id: string) {
    await delay(300);
    const item = maintenanceRequestsData.find((r) => r.id === id);
    if (!item) {
      throw { response: { data: { detail: 'Request not found' }, status: 404 } };
    }
    return transformRequest(item);
  },

  async createMaintenanceRequest(data: any) {
    await delay(500);
    // In mock mode, just return the data with a new ID
    return {
      id: `aa0e8400-e29b-41d4-a716-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  async updateMaintenanceRequest(id: string, data: any) {
    await delay(400);
    const item = maintenanceRequestsData.find((r) => r.id === id);
    if (!item) {
      throw { response: { data: { detail: 'Request not found' }, status: 404 } };
    }
    return transformRequest({ ...item, ...data });
  },

  async updateRequestStage(id: string, stage: string) {
    await delay(300);
    const item = maintenanceRequestsData.find((r) => r.id === id);
    if (!item) {
      throw { response: { data: { detail: 'Request not found' }, status: 404 } };
    }
    return transformRequest({ ...item, stage });
  },

  // Time Log endpoints
  async getTimeLogs(requestId: string) {
    await delay(400);
    return timeLogsData
      .filter((t) => t.request_id === requestId)
      .map(transformTimeLog);
  },

  async createTimeLog(requestId: string, data: any) {
    await delay(500);
    return {
      id: `bb0e8400-e29b-41d4-a716-${Date.now()}`,
      request_id: requestId,
      ...data,
      created_at: new Date().toISOString(),
    };
  },

  // Technician endpoints
  async getTechnicians() {
    await delay(400);
    return techniciansData;
  },

  async getTechnicianById(id: string) {
    await delay(300);
    const item = techniciansData.find((t) => t.id === id);
    if (!item) {
      throw { response: { data: { detail: 'Technician not found' }, status: 404 } };
    }
    return item;
  },

  // Team endpoints
  async getTeams() {
    await delay(400);
    return maintenanceTeamsData;
  },

  // Department endpoints
  async getDepartments() {
    await delay(400);
    return departmentsData;
  },

  // User endpoints
  async getUsers() {
    await delay(400);
    return usersData;
  },
};

