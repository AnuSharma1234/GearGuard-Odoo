'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import usersRawData from '../../../../../data/users.json';
import maintenanceTeamsRawData from '../../../../../data/maintenance_teams.json';

export default function NewTechnicianPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    user_id: '',
    team_id: '',
    is_active: true,
  });

  // Get technician-role users only
  const technicianUsers = usersRawData.filter((u: any) => u.role === 'technician');
  const teams = maintenanceTeamsRawData;

  const createTechnicianMutation = useMutation({
    mutationFn: (data: any) => apiClient.createTechnician(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      router.push('/dashboard/technicians');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const technicianData = {
      user_id: formData.user_id,
      team_id: formData.team_id,
      is_active: formData.is_active,
    };

    createTechnicianMutation.mutate(technicianData);
  };

  // Get selected user details
  const selectedUser = usersRawData.find((u: any) => u.id === formData.user_id);
  const selectedTeam = maintenanceTeamsRawData.find((t: any) => t.id === formData.team_id);

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
            <h1 className="text-2xl font-semibold text-white">Add New Technician</h1>
          </div>
          <p className="text-[#666666] text-sm ml-8">Assign a technician to a maintenance team</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-8">
              {/* User Selection */}
              <div className="space-y-2">
                <label htmlFor="user_id" className="text-sm font-medium text-white">
                  Select Technician<span className="ml-1 text-[#ef4444]">*</span>
                </label>
                <select
                  id="user_id"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
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
                  <option value="">Select a technician user...</option>
                  {technicianUsers.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#666666] flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Only users with "technician" role can be assigned
                </p>
              </div>

              {/* Team Selection */}
              <div className="space-y-2">
                <label htmlFor="team_id" className="text-sm font-medium text-white">
                  Assign to Team<span className="ml-1 text-[#ef4444]">*</span>
                </label>
                <select
                  id="team_id"
                  value={formData.team_id}
                  onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
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
                  <option value="">Select a maintenance team...</option>
                  {teams.map((team: any) => (
                    <option key={team.id} value={team.id}>
                      {team.name} - {team.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div className="border-t border-[#1f1f1f]"></div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Status<span className="ml-1 text-[#ef4444]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: true })}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      formData.is_active
                        ? 'bg-white text-black'
                        : 'bg-black border border-[#1f1f1f] text-[#a0a0a0] hover:text-white hover:border-[#666666]'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: false })}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      !formData.is_active
                        ? 'bg-white text-black'
                        : 'bg-black border border-[#1f1f1f] text-[#a0a0a0] hover:text-white hover:border-[#666666]'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              {/* Assignment Preview */}
              {selectedUser && selectedTeam && (
                <div className="bg-black border border-[#1f1f1f] rounded-lg p-5">
                  <div className="flex items-center mb-4">
                    <svg className="w-5 h-5 mr-2 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-medium text-white">Assignment Summary</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-[#666666]">Technician</p>
                        <p className="text-sm text-white font-medium">{selectedUser.name}</p>
                        <p className="text-xs text-[#a0a0a0]">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-[#666666]">Team</p>
                        <p className="text-sm text-white font-medium">{selectedTeam.name}</p>
                        <p className="text-xs text-[#a0a0a0]">{selectedTeam.specialization}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#1f1f1f]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#666666]">Status</span>
                      {formData.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20">
                          Inactive
                        </span>
                      )}
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
                disabled={createTechnicianMutation.isPending}
                className="px-8 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#e0e0e0] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {createTechnicianMutation.isPending ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Adding...</span>
                  </span>
                ) : 'Add Technician'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

