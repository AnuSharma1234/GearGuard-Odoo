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
    <nav className="bg-[#111118] border-b border-zinc-800 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-zinc-100">
                GearGuard
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
              {navItems.map((item) => {
                const isActive = item.href === '/dashboard' 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-sky-500 text-zinc-50'
                        : 'border-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-zinc-200">{user.name}</span>
            <span className="text-xs text-amber-200 bg-amber-900/40 px-2 py-1 rounded border border-amber-800/60">
              {user.role}
            </span>
            <button
              onClick={logout}
              className="text-sm text-zinc-400 hover:text-zinc-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

