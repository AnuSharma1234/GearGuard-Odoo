import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Equipment hooks
export function useEquipment(params?: {
  department_id?: string;
  team_id?: string;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['equipment', params],
    queryFn: () => apiClient.getEquipment(params),
  });
}

export function useEquipmentById(id: string | null) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => apiClient.getEquipmentById(id!),
    enabled: !!id,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: any) => apiClient.createEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateEquipment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

// Maintenance Request hooks
export function useMaintenanceRequests(params?: {
  stage?: string;
  request_type?: string;
  assigned_to?: string;
  equipment_id?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['maintenance-requests', params],
    queryFn: () => apiClient.getMaintenanceRequests(params),
  });
}

export function useMaintenanceRequestById(id: string | null) {
  return useQuery({
    queryKey: ['maintenance-requests', id],
    queryFn: () => apiClient.getMaintenanceRequestById(id!),
    enabled: !!id,
  });
}

export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createMaintenanceRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    },
  });
}

export function useUpdateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateMaintenanceRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests', variables.id] });
    },
  });
}

export function useDeleteMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteMaintenanceRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    },
  });
}

export function useOverdueRequests() {
  return useQuery({
    queryKey: ['maintenance-requests', 'overdue'],
    queryFn: () => apiClient.getOverdueRequests(),
  });
}

export function useCalendarRequests(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['maintenance-requests', 'calendar', startDate, endDate],
    queryFn: () => apiClient.getCalendarRequests(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// Technician hooks
export function useTechnicians(params?: { team_id?: string; search?: string }) {
  return useQuery({
    queryKey: ['technicians', params],
    queryFn: () => apiClient.getTechnicians(params),
  });
}

export function useTechnicianById(id: string | null) {
  return useQuery({
    queryKey: ['technicians', id],
    queryFn: () => apiClient.getTechnicianById(id!),
    enabled: !!id,
  });
}

// Maintenance Team hooks
export function useMaintenanceTeams(params?: { department_id?: string; search?: string }) {
  return useQuery({
    queryKey: ['maintenance-teams', params],
    queryFn: () => apiClient.getMaintenanceTeams(params),
  });
}

// Department hooks
export function useDepartments(params?: { search?: string }) {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => apiClient.getDepartments(params),
  });
}

// User hooks
export function useUsers(params?: { search?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => apiClient.getUsers(params),
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });
}

// Time Log hooks
export function useTimeLogs(requestId: string | null) {
  return useQuery({
    queryKey: ['time-logs', requestId],
    queryFn: () => apiClient.getTimeLogs(requestId!),
    enabled: !!requestId,
  });
}

export function useCreateTimeLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createTimeLog(data.request_id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['time-logs', variables.request_id] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    },
  });
}

// Error handling hook
export function useApiError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any) => {
    if (err instanceof ApiError) {
      setError(err.getUserMessage());
    } else if (err?.response?.data?.detail) {
      setError(err.response.data.detail);
    } else if (err?.message) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
}

// Generic mutation with error handling
export function useMutationWithError<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: ApiError) => void;
  }
) {
  const { error, handleError, clearError } = useApiError();

  const mutation = useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      clearError();
      options?.onSuccess?.(data, variables);
    },
    onError: (err: any) => {
      handleError(err);
      if (err instanceof ApiError) {
        options?.onError?.(err);
      }
    },
  });

  return {
    ...mutation,
    error,
    clearError,
  };
}
