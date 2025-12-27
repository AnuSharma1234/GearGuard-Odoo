'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { useMemo } from 'react';
import { permissions } from '@/lib/permissions';

export default function TechniciansPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // Check if user has access to technicians page
  if (!user || !permissions.canAccessTechnicians(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-2">Access Denied</h1>
          <p className="text-[#666666]">You don't have permission to access technicians. Only technicians, managers, and administrators can access this page.</p>
        </div>
      </div>
    );
  }

  // Fetch data from API
  const { data: techniciansData, isLoading: techniciansLoading } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => apiClient.getTechnicians(),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  });

  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['maintenance-teams'],
    queryFn: () => apiClient.getMaintenanceTeams(),
  });

  const technicians = techniciansData || [];
  const users = usersData || [];
  const teams = teamsData || [];

  const isLoading = techniciansLoading || usersLoading || teamsLoading;

  // Create lookup maps for efficient access
  const userMap = useMemo(() => {
    const map = new Map<string, any>();
    users.forEach((u: any) => map.set(u.id, u));
    return map;
  }, [users]);

  const teamMap = useMemo(() => {
    const map = new Map<string, any>();
    teams.forEach((t: any) => map.set(t.id, t));
    return map;
  }, [teams]);

  // Get technician user details
  const getTechnicianUser = (userId: string) => {
    return userMap.get(userId);
  };

  // Get team name
  const getTeamName = (teamId: string) => {
    const team = teamMap.get(teamId);
    return team?.name || 'N/A';
  };

  // Get team specialization
  const getTeamSpecialization = (teamId: string) => {
    const team = teamMap.get(teamId);
    return team?.specialization || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Technicians</h1>
          <p className="text-[#666666] text-sm mt-1">
            View and manage technician assignments
          </p>
        </div>
        {user && permissions.canManageTeams(user.role) && (
          <button 
            onClick={() => router.push('/dashboard/technicians/new')}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e0e0e0] transition-colors"
          >
            New
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search technicians..."
            className="w-full px-4 py-2 pl-10 bg-black border border-[#1f1f1f] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-[#666666]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Technicians Table */}
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black border-b border-[#1f1f1f]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#a0a0a0] uppercase tracking-wider">
                  Technician Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#a0a0a0] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#a0a0a0] uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#a0a0a0] uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#a0a0a0] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </td>
                </tr>
              ) : technicians.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#666666] text-sm">
                    No technicians found
                  </td>
                </tr>
              ) : (
                technicians.map((tech: any) => {
                  const techUser = getTechnicianUser(tech.user_id);
                  const teamName = getTeamName(tech.team_id);
                  const specialization = getTeamSpecialization(tech.team_id);

                  return (
                    <tr
                      key={tech.id}
                      className="hover:bg-black/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white text-sm font-medium">
                            {techUser?.name?.charAt(0)?.toUpperCase() || 'T'}
                          </div>
                          <span className="text-sm font-medium text-white">
                            {techUser?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#a0a0a0]">
                          {techUser?.email || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white">{getTeamName(tech.team_id)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#a0a0a0]">{getTeamSpecialization(tech.team_id)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tech.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#666666] uppercase tracking-wider">Total Technicians</p>
              <p className="text-2xl font-semibold text-white mt-1">
                {technicians.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#666666] uppercase tracking-wider">Active</p>
              <p className="text-2xl font-semibold text-[#22c55e] mt-1">
                {technicians.filter((t: any) => t.is_active).length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#666666] uppercase tracking-wider">Inactive</p>
              <p className="text-2xl font-semibold text-[#ef4444] mt-1">
                {technicians.filter((t: any) => !t.is_active).length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
