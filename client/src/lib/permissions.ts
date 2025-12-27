import { UserRole } from '@/types/users';

export const permissions = {
  // User permissions
  canCreateCorrectiveRequest(role: UserRole): boolean {
    return ['user', 'technician', 'manager', 'admin'].includes(role);
  },

  canAssignSelf(role: UserRole): boolean {
    return ['technician', 'manager', 'admin'].includes(role);
  },

  canUpdateStages(role: UserRole): boolean {
    return ['technician', 'manager', 'admin'].includes(role);
  },

  canLogTime(role: UserRole): boolean {
    return ['technician', 'manager', 'admin'].includes(role);
  },

  canSchedulePreventive(role: UserRole): boolean {
    return ['manager', 'admin'].includes(role);
  },

  canViewReports(role: UserRole): boolean {
    return ['manager', 'admin'].includes(role);
  },

  canScrapEquipment(role: UserRole): boolean {
    return ['manager', 'admin'].includes(role);
  },

  canManageUsers(role: UserRole): boolean {
    return role === 'admin';
  },

  canManageTeams(role: UserRole): boolean {
    return ['manager', 'admin'].includes(role);
  },

  // Route access
  canAccessDashboard(role: UserRole): boolean {
    return ['user', 'technician', 'manager', 'admin'].includes(role);
  },

  canAccessEquipment(role: UserRole): boolean {
    return ['user', 'technician', 'manager', 'admin'].includes(role);
  },

  canAccessRequests(role: UserRole): boolean {
    return ['user', 'technician', 'manager', 'admin'].includes(role);
  },

  canAccessTeams(role: UserRole): boolean {
    return ['technician', 'manager', 'admin'].includes(role);
  },

  canAccessTechnicians(role: UserRole): boolean {
    return ['technician', 'manager', 'admin'].includes(role);
  },

  canAccessReports(role: UserRole): boolean {
    return ['manager', 'admin'].includes(role);
  },
};

