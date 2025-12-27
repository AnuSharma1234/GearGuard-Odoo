"use client";

import Link from 'next/link';
import { User, UserRole } from '@/lib/dummyData';

type Props = {
  users: User[]; // server-provided list to validate any local user
};

// Resolve current user role from localStorage if present; fallback to minimal defaults
function getCurrentRole(users: User[]): UserRole | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<User>;
    const full = parsed?.id ? users.find((u) => u.id === parsed.id) : null;
    return (full?.role as UserRole) ?? null;
  } catch {
    return null;
  }
}

export default function QuickActions({ users }: Props) {
  const role = getCurrentRole(users);

  // Buttons styled to match dark theme and clear hierarchy.
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {role === 'admin' || role === 'manager' ? (
        <>
          <Link href="/dashboard/requests/calendar" className={`${base}`}>
            Schedule Preventive Maintenance
          </Link>
          <Link href="/reports" className={`${base}`}>
            View Reports
          </Link>
        </>
      ) : role === 'technician' ? (
        <>
          <Link href="/requests/kanban" className={`${base}`}>
            View Assigned Requests
          </Link>
        </>
      ) : (
        <>
          <Link href="/requests/kanban" className={`${base}`}>
            Create Maintenance Request
          </Link>
        </>
      )}
    </div>
  );
}
