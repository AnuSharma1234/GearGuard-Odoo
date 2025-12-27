import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { mockApi } from './mockApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false'; // Default to true

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  get instance() {
    return this.client;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    if (USE_MOCK_DATA) {
      return mockApi.login(email, password);
    }
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: { name: string; email: string; password: string; role?: string }) {
    if (USE_MOCK_DATA) {
      return mockApi.register(data);
    }
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async getCurrentUser() {
    if (USE_MOCK_DATA) {
      return mockApi.getCurrentUser();
    }
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Equipment endpoints
  async getEquipment() {
    if (USE_MOCK_DATA) {
      return mockApi.getEquipment();
    }
    const response = await this.client.get('/equipment');
    return response.data;
  }

  async getEquipmentById(id: string) {
    if (USE_MOCK_DATA) {
      return mockApi.getEquipmentById(id);
    }
    const response = await this.client.get(`/equipment/${id}`);
    return response.data;
  }

  async createEquipment(data: Partial<import('../types/equipment').Equipment>) {
    if (USE_MOCK_DATA) {
      return { ...data, id: `990e8400-e29b-41d4-a716-${Date.now()}` };
    }
    const response = await this.client.post('/equipment', data);
    return response.data;
  }

  async updateEquipment(id: string, data: Partial<import('../types/equipment').Equipment>) {
    if (USE_MOCK_DATA) {
      return { ...data, id };
    }
    const response = await this.client.patch(`/equipment/${id}`, data);
    return response.data;
  }

  async getEquipmentMaintenanceRequests(equipmentId: string) {
    if (USE_MOCK_DATA) {
      return mockApi.getEquipmentMaintenanceRequests(equipmentId);
    }
    const response = await this.client.get(`/equipment/${equipmentId}/requests`);
    return response.data;
  }

  // Maintenance Request endpoints
  async getMaintenanceRequests(params?: { stage?: string; type?: string; assigned_to?: string; equipment_id?: string }) {
    if (USE_MOCK_DATA) {
      return mockApi.getMaintenanceRequests(params);
    }
    const response = await this.client.get('/maintenance-requests', { params });
    return response.data;
  }

  async getMaintenanceRequestById(id: string) {
    if (USE_MOCK_DATA) {
      return mockApi.getMaintenanceRequestById(id);
    }
    const response = await this.client.get(`/maintenance-requests/${id}`);
    return response.data;
  }

  async createMaintenanceRequest(data: Partial<import('../types/requests').MaintenanceRequest>) {
    if (USE_MOCK_DATA) {
      return mockApi.createMaintenanceRequest(data);
    }
    const response = await this.client.post('/maintenance-requests', data);
    return response.data;
  }

  async updateMaintenanceRequest(id: string, data: Partial<import('../types/requests').MaintenanceRequest>) {
    if (USE_MOCK_DATA) {
      return mockApi.updateMaintenanceRequest(id, data);
    }
    const response = await this.client.patch(`/maintenance-requests/${id}`, data);
    return response.data;
  }

  async updateRequestStage(id: string, stage: import('../types/requests').RequestStage) {
    if (USE_MOCK_DATA) {
      return mockApi.updateRequestStage(id, stage);
    }
    const response = await this.client.patch(`/maintenance-requests/${id}`, { stage });
    return response.data;
  }

  // Time Log endpoints
  async getTimeLogs(requestId: string) {
    if (USE_MOCK_DATA) {
      return mockApi.getTimeLogs(requestId);
    }
    const response = await this.client.get(`/maintenance-requests/${requestId}/time-logs`);
    return response.data;
  }

  async createTimeLog(requestId: string, data: Partial<import('../types/requests').TimeLog>) {
    if (USE_MOCK_DATA) {
      return mockApi.createTimeLog(requestId, data);
    }
    const response = await this.client.post(`/maintenance-requests/${requestId}/time-logs`, data);
    return response.data;
  }

  // Technician endpoints
  async getTechnicians() {
    if (USE_MOCK_DATA) {
      return mockApi.getTechnicians();
    }
    const response = await this.client.get('/technicians');
    return response.data;
  }

  async getTechnicianById(id: string) {
    if (USE_MOCK_DATA) {
      return mockApi.getTechnicianById(id);
    }
    const response = await this.client.get(`/technicians/${id}`);
    return response.data;
  }

  async createTechnician(data: { user_id: string; team_id: string; is_active: boolean }) {
    if (USE_MOCK_DATA) {
      return { ...data, id: `880e8400-e29b-41d4-a716-${Date.now()}` };
    }
    const response = await this.client.post('/technicians', data);
    return response.data;
  }

  // Team endpoints
  async getTeams() {
    if (USE_MOCK_DATA) {
      return mockApi.getTeams();
    }
    const response = await this.client.get('/maintenance-teams');
    return response.data;
  }

  async createMaintenanceTeam(data: { name: string; specialization: string }) {
    if (USE_MOCK_DATA) {
      return { ...data, id: `770e8400-e29b-41d4-a716-${Date.now()}` };
    }
    const response = await this.client.post('/maintenance-teams', data);
    return response.data;
  }

  // Department endpoints
  async getDepartments() {
    if (USE_MOCK_DATA) {
      return mockApi.getDepartments();
    }
    const response = await this.client.get('/departments');
    return response.data;
  }

  // User endpoints
  async getUsers() {
    if (USE_MOCK_DATA) {
      return mockApi.getUsers();
    }
    const response = await this.client.get('/users');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
