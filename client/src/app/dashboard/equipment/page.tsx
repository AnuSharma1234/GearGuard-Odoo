'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Equipment } from '@/types/equipment';
import EquipmentModal from '@/components/equipment/EquipmentModal';

export default function EquipmentPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  const { data: equipmentData, isLoading: equipmentLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => apiClient.getEquipment(),
  });

  const { data: departmentsData, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => apiClient.getDepartments(),
  });

  const { data: techniciansData, isLoading: techniciansLoading } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => apiClient.getTechnicians(),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  });

  const equipment: any[] = equipmentData || [];
  const departments = departmentsData || [];
  const technicians = techniciansData || [];
  const users = usersData || [];

  const isLoading = equipmentLoading || departmentsLoading || techniciansLoading || usersLoading;

  // Create a map of technician ID to user name for quick lookup
  const technicianToUserMap = useMemo(() => {
    const map = new Map<string, string>();
    technicians.forEach((tech: any) => {
      const user = users.find((u: any) => u.id === tech.user_id);
      if (user) {
        map.set(tech.id, user.name);
      }
    });
    return map;
  }, [technicians, users]);

  // Get department name
  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return 'N/A';
    const dept = departments.find((d: any) => d.id === departmentId);
    return dept?.name || 'N/A';
  };

  // Get team technician name from API data
  const getTeamTechnician = (maintenanceTeamId?: string) => {
    if (!maintenanceTeamId) return 'Unassigned';
    
    // Find technicians for this team
    const teamTechnicians = technicians.filter(
      (t: any) => t.team_id === maintenanceTeamId && t.is_active === true
    );
    
    if (teamTechnicians.length === 0) {
      return 'Unassigned';
    }
    
    // Get the first technician's user info
    const firstTech = teamTechnicians[0];
    return technicianToUserMap.get(firstTech.id) || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Equipment</h1>
          <p className="text-[#666666] text-sm mt-1">
            Manage all equipment and maintenance
          </p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/equipment/new')}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-[#e0e0e0] transition-colors"
        >
          New
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-black border border-[#1f1f1f] rounded px-4 py-2 pl-10 text-white placeholder-[#666666] focus:outline-none focus:border-white transition-colors text-sm"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]"
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

      {/* Equipment Table */}
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Equipment Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Serial Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Equipment Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </td>
                </tr>
              ) : equipment.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#666666]">
                    No equipment found
                  </td>
                </tr>
              ) : (
                equipment.map((item: any) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#0a0a0a] transition-colors cursor-pointer"
                      onClick={() => setSelectedEquipmentId(item.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#a0a0a0]">
                          {item.assigned_employee || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#a0a0a0]">
                          {getDepartmentName(item.department_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#a0a0a0]">
                          {item.serial_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#a0a0a0]">
                          {getTeamTechnician(item.maintenance_team_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#a0a0a0]">
                          {item.category || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#a0a0a0]">{item.location || 'N/A'}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment Modal */}
      {selectedEquipmentId && (
        <EquipmentModal
          equipmentId={selectedEquipmentId}
          onClose={() => setSelectedEquipmentId(null)}
        />
      )}
    </div>
  );
}
