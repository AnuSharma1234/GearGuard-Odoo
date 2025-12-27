'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import equipmentRawData from '../../../data/equipment.json';
import departmentsRawData from '../../../data/departments.json';
import maintenanceTeamsRawData from '../../../data/maintenance_teams.json';
import techniciansRawData from '../../../data/technicians.json';
import usersRawData from '../../../data/users.json';

interface EquipmentModalProps {
  equipmentId: string;
  onClose: () => void;
}

export default function EquipmentModal({ equipmentId, onClose }: EquipmentModalProps) {
  const router = useRouter();
  
  const equipment = equipmentRawData.find((e: any) => e.id === equipmentId);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    // Close modal on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!equipment) {
    return null;
  }

  // Get related data
  const department = departmentsRawData.find((d: any) => d.id === equipment.department_id);
  const team = maintenanceTeamsRawData.find((t: any) => t.id === equipment.maintenance_team_id);
  
  // Get technician
  const teamTechnicians = techniciansRawData.filter((t: any) => t.team_id === equipment.maintenance_team_id && t.is_active);
  const technician = teamTechnicians.length > 0 ? usersRawData.find((u: any) => u.id === teamTechnicians[0].user_id) : null;

  const handleEdit = () => {
    router.push(`/dashboard/equipment/${equipmentId}/edit`);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20';
      case 'maintenance':
        return 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20';
      case 'scrapped':
        return 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20';
      default:
        return 'bg-[#a0a0a0]/10 text-[#a0a0a0] border-[#a0a0a0]/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1f1f1f] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{equipment.name}</h2>
              <p className="text-sm text-[#666666]">Equipment Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${getStatusColor(equipment.status)}`}>
              {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
            </span>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#e0e0e0] transition-colors"
            >
              Edit Equipment
            </button>
          </div>

          {/* Basic Information */}
          <div className="bg-black border border-[#1f1f1f] rounded-lg p-5">
            <h3 className="text-sm font-medium text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#666666] mb-1">Serial Number</p>
                <p className="text-sm text-white font-mono">{equipment.serial_number}</p>
              </div>
              <div>
                <p className="text-xs text-[#666666] mb-1">Category</p>
                <p className="text-sm text-white">{equipment.category}</p>
              </div>
              <div>
                <p className="text-xs text-[#666666] mb-1">Location</p>
                <p className="text-sm text-white">{equipment.location}</p>
              </div>
              <div>
                <p className="text-xs text-[#666666] mb-1">Department</p>
                <p className="text-sm text-white">{department?.name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Purchase & Warranty */}
          <div className="bg-black border border-[#1f1f1f] rounded-lg p-5">
            <h3 className="text-sm font-medium text-white mb-4">Purchase & Warranty</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#666666] mb-1">Purchase Date</p>
                <p className="text-sm text-white">{new Date(equipment.purchase_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-[#666666] mb-1">Warranty Expiry</p>
                <p className="text-sm text-white">
                  {new Date(equipment.warranty_expiry).toLocaleDateString()}
                  {new Date(equipment.warranty_expiry) < new Date() && (
                    <span className="ml-2 text-xs text-[#ef4444]">(Expired)</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-black border border-[#1f1f1f] rounded-lg p-5">
            <h3 className="text-sm font-medium text-white mb-4">Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#666666] mb-1">Assigned Employee</p>
                <p className="text-sm text-white">{equipment.assigned_employee || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs text-[#666666] mb-1">Maintenance Team</p>
                <p className="text-sm text-white">{team?.name || 'N/A'}</p>
                {team?.specialization && (
                  <p className="text-xs text-[#666666] mt-1">{team.specialization}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-[#666666] mb-1">Assigned Technician</p>
                <p className="text-sm text-white">{technician?.name || 'Unassigned'}</p>
                {technician?.email && (
                  <p className="text-xs text-[#666666] mt-1">{technician.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-[#1f1f1f] px-6 py-4 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-[#a0a0a0] hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

