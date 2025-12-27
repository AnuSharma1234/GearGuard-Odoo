'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { permissions } from '@/lib/permissions';

export default function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return null;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', show: permissions.canAccessDashboard(user.role) },
    { href: '/dashboard/equipment', label: 'Equipment', show: permissions.canAccessEquipment(user.role) },
    { href: '/dashboard/requests/kanban', label: 'Requests', show: permissions.canAccessRequests(user.role) },
    { href: '/dashboard/teams', label: 'Teams', show: permissions.canAccessTeams(user.role) },
    { href: '/dashboard/technicians', label: 'Technicians', show: permissions.canAccessTechnicians(user.role) },
    { href: '/dashboard/reports', label: 'Reports', show: permissions.canAccessReports(user.role) },
  ].filter(item => item.show);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                GearGuard
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{user.name}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {user.role}
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

