'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { permissions } from '@/lib/permissions';
import Image from 'next/image';

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
    <nav className="bg-black border-b border-[#1f1f1f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3">
              <Image src="/logo.png" alt="GearGuard" width={100} height={100} className="w-36" />
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'text-white'
                      : 'text-[#666666] hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-[#a0a0a0]">
              <span className="text-white">{user.name}</span>
              <span className="mx-2">·</span>
              <span className="capitalize">{user.role}</span>
            </div>
            
            <button
              onClick={logout}
              className="text-sm text-[#666666] hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
