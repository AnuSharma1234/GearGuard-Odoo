'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const SPECIALIZATIONS = [
  'Mechanical Systems',
  'Electrical Systems',
  'Hydraulic Systems',
  'Pneumatic Systems',
  'HVAC Systems',
  'Precision Equipment',
  'Robotics & Automation',
  'Material Handling',
  'General Maintenance',
  'Other',
];

export default function NewTeamPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
  });

  const createTeamMutation = useMutation({
    mutationFn: (data: any) => apiClient.createMaintenanceTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-teams'] });
      router.push('/dashboard/teams');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const teamData = {
      name: formData.name,
      specialization: formData.specialization,
    };

    createTeamMutation.mutate(teamData);
  };

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
            <h1 className="text-2xl font-semibold text-white">Add New Team</h1>
          </div>
          <p className="text-[#666666] text-sm ml-8">Create a new maintenance team</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-8">
              {/* Team Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-white">
                  Team Name<span className="ml-1 text-[#ef4444]">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-black border border-[#1f1f1f] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
                  placeholder="e.g., Alpha Maintenance"
                />
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <label htmlFor="specialization" className="text-sm font-medium text-white">
                  Specialization<span className="ml-1 text-[#ef4444]">*</span>
                </label>
                <select
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
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
                  <option value="">Select specialization...</option>
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#666666] flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Choose the primary area of expertise for this team
                </p>
              </div>

              {/* Team Preview */}
              {formData.name && formData.specialization && (
                <div className="bg-black border border-[#1f1f1f] rounded-lg p-5">
                  <div className="flex items-center mb-4">
                    <svg className="w-5 h-5 mr-2 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-medium text-white">Team Preview</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[#666666]">Team Name</p>
                      <p className="text-lg text-white font-semibold">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#666666]">Specialization</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-white/5 text-white border border-[#1f1f1f]">
                          {formData.specialization}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#1f1f1f]">
                    <p className="text-xs text-[#666666]">
                      After creation, you can assign technicians to this team from the Technicians page.
                    </p>
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
                disabled={createTeamMutation.isPending}
                className="px-8 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#e0e0e0] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {createTeamMutation.isPending ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating...</span>
                  </span>
                ) : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

