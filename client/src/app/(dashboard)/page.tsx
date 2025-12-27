'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Equipment } from '@/types/equipment';
import { MaintenanceRequest } from '@/types/requests';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: equipmentData, isLoading: equipmentLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => apiClient.getEquipment(),
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: () => apiClient.getMaintenanceRequests(),
  });

  const { data: techniciansData } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => apiClient.getTechnicians(),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  });

  const equipment: Equipment[] = equipmentData || [];
  const requests: MaintenanceRequest[] = requestsData || [];
  const technicians = techniciansData || [];
  const users = usersData || [];

  // Calculate statistics
  const criticalEquipment = equipment.filter(
    (e) => e.status === 'out_of_service' || e.status === 'maintenance'
  ).length;

  const technicianLoad = technicians.length > 0 
    ? Math.round((requests.filter((r) => r.stage === 'in_progress').length / technicians.length) * 100)
    : 0;

  const openRequests = requests.filter(
    (r) => r.stage === 'new' || r.stage === 'in_progress'
  ).length;

  const pendingRequests = requests.filter((r) => r.stage === 'new').length;
  const overdueRequests = requests.filter(
    (r) => r.priority === 'critical' && r.stage !== 'repaired' && r.stage !== 'scrap'
  ).length;

  // Get technician name helper
  const getTechnicianName = (technicianId: string | null | undefined) => {
    if (!technicianId) return 'Unassigned';
    const tech = technicians.find((t: any) => t.id === technicianId);
    if (!tech) return 'Unknown';
    const techUser = users.find((u: any) => u.id === tech.user_id);
    return techUser?.name || 'Unknown';
  };

  const isLoading = equipmentLoading || requestsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e8eaed]">Dashboard</h1>
        <p className="text-[#9aa0a6] text-sm mt-1">
          Welcome back, {user?.name || 'User'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Critical Equipment Card */}
        <Link
          href="/dashboard/equipment"
          className="bg-[#1a1f26] border border-[#3d1a1a] rounded-lg p-6 hover:border-[#8b3a3a] transition-colors group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm font-medium text-[#9aa0a6]">Critical Equipment</div>
            <div className="w-2 h-2 rounded-full bg-[#ff6b6b] animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-[#ff6b6b] mb-1">
            {isLoading ? '...' : criticalEquipment}
          </div>
          <div className="text-xs text-[#9aa0a6]">
            Units (Health &lt; 30%)
          </div>
        </Link>

        {/* Technician Load Card */}
        <div className="bg-[#1a1f26] border border-[#2d3139] rounded-lg p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm font-medium text-[#9aa0a6]">Technician Load</div>
          </div>
          <div className="text-3xl font-bold text-[#4a90e2] mb-1">
            {isLoading ? '...' : `${technicianLoad}%`}
          </div>
          <div className="text-xs text-[#9aa0a6]">
            Utilized (Assign Carefully)
          </div>
        </div>

        {/* Open Requests Card */}
        <Link
          href="/dashboard/requests/kanban"
          className="bg-[#1a1f26] border border-[#2d3139] rounded-lg p-6 hover:border-[#4a90e2] transition-colors group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm font-medium text-[#9aa0a6]">Open Requests</div>
          </div>
          <div className="text-3xl font-bold text-[#6dd47e] mb-1">
            {isLoading ? '...' : openRequests}
          </div>
          <div className="text-xs text-[#9aa0a6]">
            {pendingRequests} Pending • {overdueRequests} Overdue
          </div>
        </Link>
      </div>

      {/* Maintenance Reports Table */}
      <div className="bg-[#1a1f26] border border-[#2d3139] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2d3139] flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-[#e8eaed]">Maintenance Reports</h2>
            <p className="text-xs text-[#9aa0a6] mt-0.5">For requests to track the process</p>
          </div>
          <Link
            href="/dashboard/requests/kanban"
            className="px-4 py-2 bg-[#4a90e2] text-white text-sm font-medium rounded hover:bg-[#5a9ff2] transition-colors"
          >
            New
          </Link>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-[#2d3139]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#0f1419] border border-[#2d3139] rounded px-4 py-2 text-[#e8eaed] text-sm placeholder-[#5f6368] focus:outline-none focus:border-[#4a90e2] focus:ring-1 focus:ring-[#4a90e2] transition-colors"
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5f6368]"
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f1419]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
                  Subjects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#9aa0a6] uppercase tracking-wider">
                  Company
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d3139]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#5f6368]">
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#5f6368]">
                    No maintenance requests found
                  </td>
                </tr>
              ) : (
                requests.slice(0, 10).map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-[#0f1419] transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/requests/${request.id}`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#e8eaed]">
                        {request.title}
                      </div>
                      <div className="text-xs text-[#9aa0a6] mt-0.5">
                        {request.request_type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#e8eaed]">
                        {users.find((u: any) => u.id === request.requested_by)?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#e8eaed]">
                        {getTechnicianName(request.assigned_to)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#e8eaed] capitalize">
                        {equipment.find((e) => e.id === request.equipment_id)?.model || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          request.stage === 'new'
                            ? 'bg-[#3d3d1a] text-[#fbbf24] border border-[#5a5a1a]'
                            : request.stage === 'in_progress'
                            ? 'bg-[#1a2d3d] text-[#4a90e2] border border-[#2d4a5a]'
                            : request.stage === 'repaired'
                            ? 'bg-[#1a3d2d] text-[#6dd47e] border border-[#2d5a4a]'
                            : 'bg-[#2d2d2d] text-[#9aa0a6] border border-[#3d3d3d]'
                        }`}
                      >
                        {request.stage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#9aa0a6]">My company</div>
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
