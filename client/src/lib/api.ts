import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: { name: string; email: string; password: string; role?: string }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Equipment endpoints
  async getEquipment() {
    const response = await this.client.get('/equipment');
    return response.data;
  }

  async getEquipmentById(id: string) {
    const response = await this.client.get(`/equipment/${id}`);
    return response.data;
  }

  async createEquipment(data: Partial<import('../types/equipment').Equipment>) {
    const response = await this.client.post('/equipment', data);
    return response.data;
  }

  async updateEquipment(id: string, data: Partial<import('../types/equipment').Equipment>) {
    const response = await this.client.patch(`/equipment/${id}`, data);
    return response.data;
  }

  async getEquipmentMaintenanceRequests(equipmentId: string) {
    const response = await this.client.get(`/equipment/${equipmentId}/requests`);
    return response.data;
  }

  // Maintenance Request endpoints
  async getMaintenanceRequests(params?: { stage?: string; type?: string; assigned_to?: string }) {
    const response = await this.client.get('/maintenance-requests', { params });
    return response.data;
  }

  async getMaintenanceRequestById(id: string) {
    const response = await this.client.get(`/maintenance-requests/${id}`);
    return response.data;
  }

  async createMaintenanceRequest(data: Partial<import('../types/requests').MaintenanceRequest>) {
    const response = await this.client.post('/maintenance-requests', data);
    return response.data;
  }

  async updateMaintenanceRequest(id: string, data: Partial<import('../types/requests').MaintenanceRequest>) {
    const response = await this.client.patch(`/maintenance-requests/${id}`, data);
    return response.data;
  }

  async updateRequestStage(id: string, stage: import('../types/requests').RequestStage) {
    const response = await this.client.patch(`/maintenance-requests/${id}`, { stage });
    return response.data;
  }

  // Time Log endpoints
  async getTimeLogs(requestId: string) {
    const response = await this.client.get(`/maintenance-requests/${requestId}/time-logs`);
    return response.data;
  }

  async createTimeLog(requestId: string, data: Partial<import('../types/requests').TimeLog>) {
    const response = await this.client.post(`/maintenance-requests/${requestId}/time-logs`, data);
    return response.data;
  }

  // Technician endpoints
  async getTechnicians() {
    const response = await this.client.get('/technicians');
    return response.data;
  }

  async getTechnicianById(id: string) {
    const response = await this.client.get(`/technicians/${id}`);
    return response.data;
  }

  // Team endpoints
  async getTeams() {
    const response = await this.client.get('/maintenance-teams');
    return response.data;
  }

  // Department endpoints
  async getDepartments() {
    const response = await this.client.get('/departments');
    return response.data;
  }

  // User endpoints
  async getUsers() {
    const response = await this.client.get('/users');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;

