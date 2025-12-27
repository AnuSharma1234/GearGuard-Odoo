'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import equipmentRawData from '../../../../../../data/equipment.json';
import departmentsRawData from '../../../../../../data/departments.json';
import maintenanceTeamsRawData from '../../../../../../data/maintenance_teams.json';
import usersRawData from '../../../../../../data/users.json';

const EQUIPMENT_CATEGORIES = [
  'Machining',
  'Hydraulics',
  'Electrical',
  'Material Handling',
  'HVAC',
  'Pneumatics',
  'Robotics',
  'Other',
];

const EQUIPMENT_STATUS = [
  'active',
  'maintenance',
  'scrapped',
];

export default function EditEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params.id as string;
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    category: '',
    purchase_date: '',
    warranty_expiry: '',
    location: '',
    department_id: '',
    assigned_employee: '',
    maintenance_team_id: '',
    status: 'active',
  });

  const [isLoading, setIsLoading] = useState(true);

  const departments = departmentsRawData;
  const teams = maintenanceTeamsRawData;
  const users = usersRawData;

  // Load equipment data
  useEffect(() => {
    const equipment = equipmentRawData.find((e: any) => e.id === equipmentId);
    if (equipment) {
      setFormData({
        name: equipment.name,
        serial_number: equipment.serial_number,
        category: equipment.category,
        purchase_date: equipment.purchase_date,
        warranty_expiry: equipment.warranty_expiry,
        location: equipment.location,
        department_id: equipment.department_id,
        assigned_employee: equipment.assigned_employee,
        maintenance_team_id: equipment.maintenance_team_id,
        status: equipment.status,
      });
      setIsLoading(false);
    }
  }, [equipmentId]);

  const updateEquipmentMutation = useMutation({
    mutationFn: (data: any) => apiClient.updateEquipment(equipmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      router.push('/dashboard/equipment');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const equipmentData = {
      name: formData.name,
      serial_number: formData.serial_number,
      category: formData.category,
      purchase_date: formData.purchase_date,
      warranty_expiry: formData.warranty_expiry,
      location: formData.location,
      department_id: formData.department_id,
      assigned_employee: formData.assigned_employee,
      maintenance_team_id: formData.maintenance_team_id,
      status: formData.status,
    };

    updateEquipmentMutation.mutate(equipmentData);
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
            <h1 className="text-2xl font-semibold text-white">Edit Equipment</h1>
          </div>
          <p className="text-[#666666] text-sm ml-8">Update equipment information</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-8">
              {/* Equipment Name & Serial Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Equipment Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-white">
                    Equipment Name<span className="ml-1 text-[#ef4444]">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-black border border-[#1f1f1f] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
                    placeholder="e.g., CNC Machine #1"
                  />
                </div>

                {/* Serial Number */}
                <div className="space-y-2">
                  <label htmlFor="serial_number" className="text-sm font-medium text-white">
                    Serial Number<span className="ml-1 text-[#ef4444]">*</span>
                  </label>
                  <input
                    id="serial_number"
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-black border border-[#1f1f1f] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm font-mono"
                    placeholder="e.g., CNC-2020-001"
                  />
                </div>
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium text-white">
                    Equipment Category<span className="ml-1 text-[#ef4444]">*</span>
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    <option value="">Select category...</option>
                    {EQUIPMENT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium text-white">
                    Location<span className="ml-1 text-[#ef4444]">*</span>
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-black border border-[#1f1f1f] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
                    placeholder="e.g., Building A - Floor 2"
                  />
                </div>
              </div>

              {/* Purchase Date & Warranty Expiry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Date */}
                <div className="space-y-2">
                  <label htmlFor="purchase_date" className="text-sm font-medium text-white">
                    Purchase Date<span className="ml-1 text-[#ef4444]">*</span>
                  </label>
                  <input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-black border border-[#1f1f1f] rounded-lg text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                {/* Warranty Expiry */}
                <div className="space-y-2">
                  <label htmlFor="warranty_expiry" className="text-sm font-medium text-white">
                    Warranty Expiry<span className="ml-1 text-[#ef4444]">*</span>
                  </label>
                  <input
                    id="warranty_expiry"
                    type="date"
                    value={formData.warranty_expiry}
                    onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                    required
                    min={formData.purchase_date || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-black border border-[#1f1f1f] rounded-lg text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#1f1f1f]"></div>

              {/* Department & Maintenance Team */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department */}
                <div className="space-y-2">
                  <label htmlFor="department_id" className="text-sm font-medium text-white">
                    Department<span className="ml-1 text-[#ef4444]">*</span>
                  </label>
                  <select
                    id="department_id"
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
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
                    <option value="">Select department...</option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Maintenance Team */}
                <div className="space-y-2">
                  <label htmlFor="maintenance_team_id" className="text-sm font-medium text-white">
                    Maintenance Team<span className="ml-1 text-[#ef4444]">*</span>
                  </label>
                  <select
                    id="maintenance_team_id"
                    value={formData.maintenance_team_id}
                    onChange={(e) => setFormData({ ...formData, maintenance_team_id: e.target.value })}
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
                    <option value="">Select maintenance team...</option>
                    {teams.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assigned Employee & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assigned Employee */}
                <div className="space-y-2">
                  <label htmlFor="assigned_employee" className="text-sm font-medium text-white">
                    Assigned Employee<span className="ml-1 text-[#ef4444]">*</span>
                  </label>
                  <select
                    id="assigned_employee"
                    value={formData.assigned_employee}
                    onChange={(e) => setFormData({ ...formData, assigned_employee: e.target.value })}
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
                    <option value="">Select employee...</option>
                    {users.map((u: any) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium text-white">
                    Status<span className="ml-1 text-[#ef4444]">*</span>
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                    {EQUIPMENT_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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
                disabled={updateEquipmentMutation.isPending}
                className="px-8 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#e0e0e0] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {updateEquipmentMutation.isPending ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Updating...</span>
                  </span>
                ) : 'Update Equipment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

