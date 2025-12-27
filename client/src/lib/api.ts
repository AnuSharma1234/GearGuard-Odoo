import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { mockApi } from './mockApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false'; // Default to true

// Custom API Error class for typed error handling
export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: Record<string, unknown>;

  constructor(message: string, status: number, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  getUserMessage(): string {
    if (this.status === 401) return 'Please log in to continue';
    if (this.status === 403) return 'You do not have permission to perform this action';
    if (this.status === 404) return 'The requested resource was not found';
    if (this.status >= 500) return 'A server error occurred. Please try again later.';
    return this.message || 'An unexpected error occurred';
  }
}

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
    // Server uses OAuth2PasswordRequestForm which expects form data with 'username' field
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const response = await this.client.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  }

  async register(data: { name: string; email: string; password: string; role?: string }) {
    if (USE_MOCK_DATA) {
      return mockApi.register(data);
    }
    const response = await this.client.post('/api/auth/register', data);
    return response.data;
  }

  async getCurrentUser() {
    if (USE_MOCK_DATA) {
      return mockApi.getCurrentUser();
    }
    const response = await this.client.get('/api/users/me');
    return response.data;
  }

  // Equipment endpoints
  async getEquipment(params?: { department_id?: string; team_id?: string; category?: string; search?: string }) {
    if (USE_MOCK_DATA) {
      return mockApi.getEquipment();
    }
    const response = await this.client.get('/api/equipment', { params });
    return response.data;
  }

  async getEquipmentById(id: string) {
    if (USE_MOCK_DATA) {
      return mockApi.getEquipmentById(id);
    }
    const response = await this.client.get(`/api/equipment/${id}`);
    return response.data;
  }

  async createEquipment(data: Partial<import('../types/equipment').Equipment>) {
    if (USE_MOCK_DATA) {
      return { ...data, id: `990e8400-e29b-41d4-a716-${Date.now()}` };
    }
    const response = await this.client.post('/api/equipment', data);
    return response.data;
  }

  async updateEquipment(id: string, data: Partial<import('../types/equipment').Equipment>) {
    if (USE_MOCK_DATA) {
      return { ...data, id };
    }
    const response = await this.client.patch(`/api/equipment/${id}`, data);
    return response.data;
  }

  async deleteEquipment(id: string) {
    if (USE_MOCK_DATA) {
      return { success: true };
    }
    const response = await this.client.delete(`/api/equipment/${id}`);
    return response.data;
  }

  async getEquipmentMaintenanceRequests(equipmentId: string) {
    if (USE_MOCK_DATA) {
      return mockApi.getEquipmentMaintenanceRequests(equipmentId);
    }
    const response = await this.client.get(`/api/equipment/${equipmentId}/requests`);
    return response.data;
  }

  // Maintenance Request endpoints
  async getMaintenanceRequests(params?: { stage?: string; type?: string; assigned_to?: string; equipment_id?: string }) {
    if (USE_MOCK_DATA) {
      return mockApi.getMaintenanceRequests(params);
    }
    const response = await this.client.get('/api/maintenance-requests', { params });
    return response.data;
  }

  async getMaintenanceRequestById(id: string) {
    if (USE_MOCK_DATA) {
      return mockApi.getMaintenanceRequestById(id);
    }
    const response = await this.client.get(`/api/maintenance-requests/${id}`);
    return response.data;
  }

  async createMaintenanceRequest(data: Partial<import('../types/requests').MaintenanceRequest>) {
    if (USE_MOCK_DATA) {
      return mockApi.createMaintenanceRequest(data);
    }
    const response = await this.client.post('/api/maintenance-requests', data);
    return response.data;
  }

  async updateMaintenanceRequest(id: string, data: Partial<import('../types/requests').MaintenanceRequest>) {
    if (USE_MOCK_DATA) {
      return mockApi.updateMaintenanceRequest(id, data);
    }
    const response = await this.client.patch(`/api/maintenance-requests/${id}`, data);
    return response.data;
  }

  async deleteMaintenanceRequest(id: string) {
    if (USE_MOCK_DATA) {
      return { success: true };
    }
    const response = await this.client.delete(`/api/maintenance-requests/${id}`);
    return response.data;
  }

  async updateRequestStage(id: string, stage: import('../types/requests').RequestStage) {
    if (USE_MOCK_DATA) {
      return mockApi.updateRequestStage(id, stage);
    }
    const response = await this.client.patch(`/api/maintenance-requests/${id}`, { stage });
    return response.data;
  }

  async getOverdueRequests() {
    if (USE_MOCK_DATA) {
      return [];
    }
    const response = await this.client.get('/api/maintenance-requests/overdue');
    return response.data;
  }

  async getCalendarRequests(startDate: string, endDate: string) {
    if (USE_MOCK_DATA) {
      return [];
    }
    const response = await this.client.get('/api/maintenance-requests/calendar', { params: { start_date: startDate, end_date: endDate } });
    return response.data;
  }

  // Time Log endpoints
  async getTimeLogs(requestId: string) {
    if (USE_MOCK_DATA) {
      return mockApi.getTimeLogs(requestId);
    }
    const response = await this.client.get(`/api/maintenance-requests/${requestId}/time-logs`);
    return response.data;
  }

  async createTimeLog(requestId: string, data: Partial<import('../types/requests').TimeLog>) {
    if (USE_MOCK_DATA) {
      return mockApi.createTimeLog(requestId, data);
    }
    const response = await this.client.post(`/api/maintenance-requests/${requestId}/time-logs`, data);
    return response.data;
  }

  // Technician endpoints
  async getTechnicians(params?: { team_id?: string; search?: string }) {
    if (USE_MOCK_DATA) {
      return mockApi.getTechnicians();
    }
    const response = await this.client.get('/api/technicians', { params });
    return response.data;
  }

  async getTechnicianById(id: string) {
    if (USE_MOCK_DATA) {
      return mockApi.getTechnicianById(id);
    }
    const response = await this.client.get(`/api/technicians/${id}`);
    return response.data;
  }

  // Team endpoints
  async getMaintenanceTeams(params?: { department_id?: string; search?: string }) {
    if (USE_MOCK_DATA) {
      return mockApi.getTeams();
    }
    const response = await this.client.get('/api/maintenance-teams', { params });
    return response.data;
  }

  // Department endpoints
  async getDepartments(params?: { search?: string }) {
    if (USE_MOCK_DATA) {
      return mockApi.getDepartments();
    }
    const response = await this.client.get('/api/departments', { params });
    return response.data;
  }

  // User endpoints
  async getUsers(params?: { search?: string }) {
    if (USE_MOCK_DATA) {
      return mockApi.getUsers();
    }
    const response = await this.client.get('/api/users', { params });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
