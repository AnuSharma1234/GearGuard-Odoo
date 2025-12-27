'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { permissions } from '@/lib/permissions';

export default function TeamsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // Check if user has access to teams page
  if (!user || !permissions.canAccessTeams(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-2">Access Denied</h1>
          <p className="text-[#666666]">You don't have permission to access teams. Only technicians, managers, and administrators can access this page.</p>
        </div>
      </div>
    );
  }

  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => apiClient.getMaintenanceTeams(),
  });

  const { data: techniciansData, isLoading: techniciansLoading } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => apiClient.getTechnicians(),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  });

  const teams = teamsData || [];
  const technicians = techniciansData || [];
  const users = usersData || [];

  const isLoading = teamsLoading || techniciansLoading || usersLoading;

  // Get team members for a specific team
  const getTeamMembers = (teamId: string) => {
    const teamTechnicians = technicians.filter((t: any) => t.team_id === teamId && t.is_active);
    return teamTechnicians
      .map((tech: any) => {
        const techUser = users.find((u: any) => u.id === tech.user_id);
        return techUser?.name || 'Unknown';
      })
      .join(', ') || 'No members';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Teams</h1>
          <p className="text-[#666666] text-sm mt-1">
            Manage maintenance teams and members
          </p>
        </div>
        {user && permissions.canManageTeams(user.role) && (
          <button 
            onClick={() => router.push('/dashboard/teams/new')}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e0e0e0] transition-colors"
          >
            New
          </button>
        )}
      </div>

      {/* Teams Table */}
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Team Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Team Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Specialization
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-[#666666]">
                    No teams found
                  </td>
                </tr>
              ) : (
                teams.map((team: any) => (
                  <tr
                    key={team.id}
                    className="hover:bg-[#0a0a0a] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">
                        {team.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#a0a0a0]">
                        {getTeamMembers(team.id)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#a0a0a0]">{team.specialization}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
