'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import equipmentRawData from '../../../../../../data/equipment.json';
import techniciansRawData from '../../../../../../data/technicians.json';
import usersRawData from '../../../../../../data/users.json';
import maintenanceRequestsRawData from '../../../../../../data/maintenance_requests.json';

export default function EditMaintenanceRequestPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    equipment_id: '',
    maintenance_type: 'corrective',
    technician_id: '',
    scheduled_date: '',
  });

  const [isLoading, setIsLoading] = useState(true);

  const { data: equipmentData } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => apiClient.getEquipment(),
  });

  const equipment = equipmentData || [];

  // Load request data
  useEffect(() => {
    const request = maintenanceRequestsRawData.find((r: any) => r.id === requestId);
    if (request) {
      setFormData({
        subject: request.subject,
        description: request.description || '',
        equipment_id: request.equipment_id,
        maintenance_type: request.request_type,
        technician_id: request.assigned_to || '',
        scheduled_date: request.scheduled_date || '',
      });
      setIsLoading(false);
    }
  }, [requestId]);

  // Get equipment details
  const selectedEquipment = equipmentRawData.find((e: any) => e.id === formData.equipment_id);
  const selectedTeamId = selectedEquipment?.maintenance_team_id;

  // Get technicians for the equipment's team
  const getTeamTechnicians = (teamId: string) => {
    const teamTechs = techniciansRawData.filter((t: any) => t.team_id === teamId && t.is_active);
    return teamTechs.map((tech: any) => {
      const techUser = usersRawData.find((u: any) => u.id === tech.user_id);
      return {
        id: tech.id,
        name: techUser?.name || 'Unknown',
        user_id: tech.user_id,
      };
    });
  };

  const availableTechnicians = selectedTeamId ? getTeamTechnicians(selectedTeamId) : [];

  const updateRequestMutation = useMutation({
    mutationFn: (data: any) => apiClient.updateMaintenanceRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      router.push('/dashboard');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const requestData = {
      title: formData.subject,
      description: formData.description,
      equipment_id: formData.equipment_id,
      assigned_to: formData.technician_id || undefined,
      request_type: formData.maintenance_type,
      scheduled_date: formData.scheduled_date || undefined,
    };

    updateRequestMutation.mutate(requestData);
  };

  const handleEquipmentChange = (equipmentId: string) => {
    setFormData({
      ...formData,
      equipment_id: equipmentId,
      technician_id: '', // Reset technician when equipment changes
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <button
              onClick={() => router.back()}
              className="text-[#666666] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-white">Edit Maintenance Request</h1>
          </div>
          <p className="text-[#666666] text-sm ml-8">Update maintenance request details</p>
        </div>

        {/* Form Card - Same improved design as create form */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-8">
              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-white">
                  Subject<span className="ml-1 text-[#ef4444]">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-black border border-[#1f1f1f] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
                  placeholder="e.g., Annual preventive maintenance"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-white">
                  Description
                  <span className="ml-2 text-xs font-normal text-[#666666]">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-[#1f1f1f] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm resize-none"
                  placeholder="Provide detailed information about the maintenance required..."
                />
              </div>

              {/* Divider */}
              <div className="border-t border-[#1f1f1f]"></div>

              {/* Equipment & Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Equipment */}
                <div className="space-y-2">
                  <label htmlFor="equipment" className="text-sm font-medium text-white">
                    Equipment<span className="ml-1 text-[#ef4444]">*</span>
                  </label>
                  <select
                    id="equipment"
                    value={formData.equipment_id}
                    onChange={(e) => handleEquipmentChange(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black border border-[#1f1f1f] rounded-lg text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select equipment...</option>
                    {equipment.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Maintenance Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Maintenance Type<span className="ml-1 text-[#ef4444]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, maintenance_type: 'corrective' })}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        formData.maintenance_type === 'corrective'
                          ? 'bg-white text-black'
                          : 'bg-black border border-[#1f1f1f] text-[#a0a0a0] hover:text-white hover:border-[#666666]'
                      }`}
                    >
                      Corrective
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, maintenance_type: 'preventive' })}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        formData.maintenance_type === 'preventive'
                          ? 'bg-white text-black'
                          : 'bg-black border border-[#1f1f1f] text-[#a0a0a0] hover:text-white hover:border-[#666666]'
                      }`}
                    >
                      Preventive
                    </button>
                  </div>
                </div>
              </div>

              {/* Technician & Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Technician */}
                <div className="space-y-2">
                  <label htmlFor="technician" className="text-sm font-medium text-white">
                    Assign Technician
                    <span className="ml-2 text-xs font-normal text-[#666666]">(Optional)</span>
                  </label>
                  <select
                    id="technician"
                    value={formData.technician_id}
                    onChange={(e) => setFormData({ ...formData, technician_id: e.target.value })}
                    disabled={!selectedEquipment}
                    className="w-full px-4 py-3 bg-black border border-[#1f1f1f] rounded-lg text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Unassigned</option>
                    {availableTechnicians.map((tech: any) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                  {!selectedEquipment && (
                    <p className="text-xs text-[#666666] flex items-center mt-1">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Select equipment first
                    </p>
                  )}
                </div>

                {/* Scheduled Date */}
                <div className="space-y-2">
                  <label htmlFor="scheduled_date" className="text-sm font-medium text-white">
                    Scheduled Date
                    {formData.maintenance_type === 'preventive' && <span className="ml-1 text-[#ef4444]">*</span>}
                  </label>
                  <input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required={formData.maintenance_type === 'preventive'}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-black border border-[#1f1f1f] rounded-lg text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                  {formData.maintenance_type === 'preventive' && !formData.scheduled_date && (
                    <p className="text-xs text-[#eab308] flex items-center mt-1">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Required for preventive maintenance
                    </p>
                  )}
                </div>
              </div>

              {/* Equipment Info Display */}
              {selectedEquipment && (
                <div className="bg-black border border-[#1f1f1f] rounded-lg p-5">
                  <div className="flex items-center mb-4">
                    <svg className="w-5 h-5 mr-2 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-medium text-white">Equipment Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-[#666666]">Serial Number</p>
                      <p className="text-sm text-white font-mono">{selectedEquipment.serial_number}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#666666]">Category</p>
                      <p className="text-sm text-white">{selectedEquipment.category}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-[#666666]">Location</p>
                      <p className="text-sm text-white">{selectedEquipment.location}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="px-8 py-6 bg-[#0a0a0a] border-t border-[#1f1f1f] rounded-b-xl flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 text-sm font-medium text-[#a0a0a0] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateRequestMutation.isPending}
                className="px-8 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#e0e0e0] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {updateRequestMutation.isPending ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Updating...</span>
                  </span>
                ) : 'Update Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
