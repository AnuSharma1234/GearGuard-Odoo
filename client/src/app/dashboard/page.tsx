import Link from 'next/link';
import { format } from 'date-fns';
import {
  getUsers,
  getEquipment,
  getMaintenanceRequests,
  getTechnicians,
  resolveTechnicianName,
  type MaintenanceRequest,
} from '@/lib/dummyData';
import StatusBadge from '@/components/dashboard/StatusBadge';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivityTable from '@/components/dashboard/RecentActivityTable';

// Server Component: loads dummy data and renders the operational overview
export default async function DashboardPage() {
  // Simulate API calls by reading JSON files (server-side)
  const [users, equipment, requests, technicians] = await Promise.all([
    getUsers(),
    getEquipment(),
    getMaintenanceRequests(),
    getTechnicians(),
  ]);

  // KPIs
  const totalActiveEquipment = equipment.filter((e) => e.status === 'active').length;
  const openRequests = requests.filter((r) => r.stage === 'new' || r.stage === 'in_progress').length;
  const overdueRequests = requests.filter((r) => r.overdue).length;
  const preventiveScheduled = requests.filter((r) => r.request_type === 'preventive').length;

  // Recent activity (latest 5)
  const recent: (MaintenanceRequest & {
    equipment_name: string;
    technician_name: string;
  })[] = [...requests]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((r) => ({
      ...r,
      equipment_name: equipment.find((e) => e.id === r.equipment_id)?.name ?? 'Unknown Equipment',
      technician_name: resolveTechnicianName(r.assigned_to ?? null, technicians, users),
    }));

  // Overdue highlight (up to 3)
  const overdueTop = requests
    .filter((r) => r.overdue)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)
    .map((r) => ({
      id: r.id,
      subject: r.subject,
      equipment: equipment.find((e) => e.id === r.equipment_id)?.name ?? 'Unknown Equipment',
      technician: resolveTechnicianName(r.assigned_to ?? null, technicians, users),
    }));

  return (
    <div className="space-y-8 p-6 bg-zinc-950 text-zinc-100 min-h-[calc(100vh-4rem)]">
      {/* Title */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-400">Operational overview of maintenance activities</p>
        </div>
        <Link
          href="/dashboard/requests/new"
          className="px-6 py-2 bg-white text-black text-sm font-medium rounded hover:bg-zinc-200 transition-colors"
        >
          New
        </Link>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Equipment" value={totalActiveEquipment} tone="zinc" />
        <StatCard label="Open Maintenance Requests" value={openRequests} tone="amber" />
        <StatCard label="Overdue Requests" value={overdueRequests} tone="red" />
        <StatCard label="Preventive Scheduled" value={preventiveScheduled} tone="sky" />
      </section>

      {/* Recent Maintenance Activity */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Recent Maintenance Activity</h2>
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60">
          {recent.length === 0 ? (
            <div className="p-6 text-zinc-400">No recent activity.</div>
          ) : (
            <RecentActivityTable requests={recent} />
          )}
        </div>
      </section>

      {/* Overdue Highlight */}
      {overdueTop.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Overdue Alerts</h2>
          <div className="rounded-lg border border-red-800 bg-red-950/30">
            <ul className="divide-y divide-red-900/40">
              {overdueTop.map((o) => (
                <li key={o.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-red-200">{o.subject}</p>
                      <p className="text-sm text-red-300/80">
                        {o.equipment} • {o.technician}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/requests/${o.id}/edit`}
                      className="text-sm px-3 py-1.5 rounded-md bg-red-900/40 text-red-100 border border-red-800 hover:bg-red-900/60"
                    >
                      Review
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Role-aware Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Quick Actions</h2>
        <QuickActions users={users} />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = 'zinc',
}: {
  label: string;
  value: number;
  tone?: 'zinc' | 'amber' | 'red' | 'sky';
}) {
  const tones: Record<string, { bg: string; border: string; text: string }> = {
    zinc: { bg: 'bg-zinc-900/60', border: 'border-zinc-800', text: 'text-zinc-200' },
    amber: { bg: 'bg-amber-900/30', border: 'border-amber-800/60', text: 'text-amber-200' },
    red: { bg: 'bg-red-900/30', border: 'border-red-800/60', text: 'text-red-200' },
    sky: { bg: 'bg-sky-900/30', border: 'border-sky-800/60', text: 'text-sky-200' },
  };
  const t = tones[tone];
  return (
    <div className={`rounded-lg border ${t.border} ${t.bg} p-4`}> 
      <div className="text-sm text-zinc-400">{label}</div>
      <div className={`mt-2 text-3xl font-semibold ${t.text}`}>{value}</div>
    </div>
  );
}

