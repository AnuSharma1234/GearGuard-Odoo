'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { permissions } from '@/lib/permissions';
import { useAuthStore } from '@/store/authStore';
import maintenanceRequestsJson from '@/data/maintenance_requests.json';
import equipmentJson from '@/data/equipment.json';
import techniciansJson from '@/data/technicians.json';
import usersJson from '@/data/users.json';
import timeLogsJson from '@/data/time_logs.json';
import maintenanceTeamsJson from '@/data/maintenance_teams.json';
import {
  Equipment,
  MaintenanceRequest,
  RequestStage,
  Technician,
  TimeLog,
  User,
} from '@/lib/dummyData';

type RequestWithRelations = {
  request: MaintenanceRequest;
  equipment: Equipment | null;
  maintenanceTeamName: string;
  detectedBy: User | null;
  assignedTechnician: Technician | null;
  assignedTechnicianUser: User | null;
};

const maintenanceRequestsData = maintenanceRequestsJson as MaintenanceRequest[];
const equipmentData = equipmentJson as Equipment[];
const techniciansData = techniciansJson as Technician[];
const usersData = usersJson as User[];
const timeLogsData = timeLogsJson as TimeLog[];
const maintenanceTeamsData = maintenanceTeamsJson as { id: string; name: string }[];

const stageOrder: RequestStage[] = ['new', 'in_progress', 'repaired', 'scrap'];

function formatDate(value?: string, pattern = 'yyyy-MM-dd HH:mm') {
  if (!value) return '—';
  try {
    return format(new Date(value), pattern);
  } catch (error) {
    return '—';
  }
}

function buildRelations(request: MaintenanceRequest | null): RequestWithRelations | null {
  if (!request) return null;
  const equipment = equipmentData.find((e) => e.id === request.equipment_id) || null;
  const maintenanceTeamName = equipment
    ? maintenanceTeamsData.find((team) => team.id === equipment.maintenance_team_id)?.name ?? 'Unknown team'
    : 'Unknown team';
  const detectedBy = usersData.find((u) => u.id === request.detected_by) || null;
  const assignedTechnician = request.assigned_to
    ? techniciansData.find((t) => t.id === request.assigned_to) || null
    : null;
  const assignedTechnicianUser = assignedTechnician
    ? usersData.find((u) => u.id === assignedTechnician.user_id) || null
    : null;

  return {
    request,
    equipment,
    maintenanceTeamName,
    detectedBy,
    assignedTechnician,
    assignedTechnicianUser,
  };
}

function resolveRoleFromUsers(currentUserId?: string | null) {
  if (!currentUserId) return null;
  return usersData.find((u) => u.id === currentUserId) ?? null;
}

function stageLabel(stage: RequestStage) {
  switch (stage) {
    case 'new':
      return 'New';
    case 'in_progress':
      return 'In Progress';
    case 'repaired':
      return 'Repaired';
    case 'scrap':
      return 'Scrap';
    default:
      return stage;
  }
}

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;
  const { user: authedUser } = useAuthStore();

  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [showTimeLogModal, setShowTimeLogModal] = useState(false);
  const [overrideStage, setOverrideStage] = useState<RequestStage>('new');
  const [reassignTechnicianId, setReassignTechnicianId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const foundRequest = maintenanceRequestsData.find((item) => item.id === requestId) || null;
    setRequest(foundRequest);
    const initialLogs = timeLogsData.filter((log) => log.request_id === requestId);
    setTimeLogs(initialLogs);
  }, [requestId]);

  useEffect(() => {
    // Align role with users.json to satisfy the constraint and avoid stale localStorage values.
    if (authedUser) {
      const matched = usersData.find((u) => u.id === authedUser.id || u.email === authedUser.email);
      setCurrentUser(matched ?? null);
      return;
    }

    try {
      const cached = localStorage.getItem('auth_user');
      if (cached) {
        const parsed = JSON.parse(cached) as Partial<User>;
        const matched = usersData.find((u) => u.id === parsed.id || u.email === parsed.email);
        setCurrentUser(matched ?? null);
      }
    } catch {
      setCurrentUser(null);
    }
  }, [authedUser]);

  const relations = useMemo(() => buildRelations(request), [request]);
  const currentTechnician = useMemo(
    () => (currentUser ? techniciansData.find((t) => t.user_id === currentUser.id && t.is_active) ?? null : null),
    [currentUser]
  );

  const canAssignSelf =
    !!currentTechnician &&
    !!currentUser &&
    permissions.canAssignSelf(currentUser.role) &&
    request?.assigned_to == null;

  const canMarkInProgress =
    !!currentUser &&
    permissions.canUpdateStages(currentUser.role) &&
    request?.stage === 'new';

  const canMarkRepaired =
    !!currentUser &&
    permissions.canUpdateStages(currentUser.role) &&
    request?.stage === 'in_progress';

  const canScrap = !!currentUser && permissions.canScrapEquipment(currentUser.role) && request?.stage !== 'scrap';

  const canLogTime =
    !!currentUser &&
    permissions.canLogTime(currentUser.role) &&
    !!currentTechnician &&
    request?.stage !== 'scrap';

  const canOverrideStage = !!currentUser && ['manager', 'admin'].includes(currentUser.role);
  const canReassign = canOverrideStage;

  useEffect(() => {
    if (request) {
      setOverrideStage(request.stage);
      setReassignTechnicianId(request.assigned_to ?? '');
    }
  }, [request]);

  const handleAssignSelf = () => {
    if (!canAssignSelf || !currentTechnician) return;
    setRequest((prev) => (prev ? { ...prev, assigned_to: currentTechnician.id } : prev));
    setReassignTechnicianId(currentTechnician.id);
  };

  const handleStageChange = (nextStage: RequestStage) => {
    if (!request) return;
    // Ensure workflow order is respected unless manager/admin overrides explicitly.
    const currentIndex = stageOrder.indexOf(request.stage);
    const nextIndex = stageOrder.indexOf(nextStage);
    const canMove =
      nextIndex >= currentIndex ||
      (currentUser && ['manager', 'admin'].includes(currentUser.role));

    if (!canMove) return;
    setRequest({ ...request, stage: nextStage });
  };

  const handleTimeLogSave = (hours: number) => {
    if (!request || !currentTechnician) return;
    const newLog: TimeLog = {
      id: `bb0e8400-e29b-41d4-a716-${Date.now()}`,
      request_id: request.id,
      technician_id: currentTechnician.id,
      hours_spent: hours,
      logged_at: new Date().toISOString(),
    };

    // Append locally to simulate persistence.
    setTimeLogs((prev) => [newLog, ...prev]);
    setShowTimeLogModal(false);
  };

  const handleOverrideStage = () => {
    if (!canOverrideStage || !request) return;
    handleStageChange(overrideStage);
  };

  const handleReassign = () => {
    if (!canReassign || !request) return;
    const nextAssignee = reassignTechnicianId || null;
    setRequest({ ...request, assigned_to: nextAssignee });
  };

  if (!request || !relations) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0e1a] text-zinc-100">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">Request not found</div>
          <p className="text-zinc-400">The maintenance request you are looking for does not exist.</p>
          <Link
            href="/dashboard/requests/kanban"
            className="inline-flex items-center px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm hover:bg-zinc-700"
          >
            Back to Kanban
          </Link>
        </div>
      </div>
    );
  }

  const { equipment, maintenanceTeamName, detectedBy, assignedTechnicianUser } = relations;

  return (
    <div className="space-y-6 text-zinc-100">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/requests/kanban"
            className="text-sm text-sky-300 hover:text-sky-200"
          >
            ← Back to Kanban Board
          </Link>
          {request.overdue && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-900/40 text-red-200 border border-red-700/60">
              Overdue
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-zinc-800 border border-zinc-700 uppercase">
            {request.request_type}
          </span>
          <StatusBadge stage={request.stage} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] border border-zinc-800 rounded-xl p-6 shadow-lg shadow-black/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Request</p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-1 leading-tight">
              {request.subject}
            </h1>
            <p className="text-zinc-400 mt-2 max-w-3xl">{request.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <div className="text-xs text-zinc-500">Created</div>
            <div className="text-sm text-zinc-200">{formatDate(request.created_at, 'yyyy-MM-dd HH:mm')}</div>
            {request.request_type === 'preventive' && request.scheduled_date && (
              <div className="text-xs text-amber-200 bg-amber-900/30 border border-amber-700/50 px-2 py-1 rounded-md">
                Scheduled: {formatDate(request.scheduled_date, 'yyyy-MM-dd')}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard label="Equipment">
            <div className="flex flex-col gap-1">
              <Link
                href={equipment ? `/dashboard/equipment/${equipment.id}` : '#'}
                className="text-sky-300 hover:text-sky-200 font-medium"
              >
                {equipment?.name ?? 'Unknown equipment'}
              </Link>
              <p className="text-xs text-zinc-400">Serial: {equipment?.serial_number ?? '—'}</p>
            </div>
          </InfoCard>
          <InfoCard label="Maintenance Team">{maintenanceTeamName}</InfoCard>
          <InfoCard label="Detected By">
            <div className="flex flex-col">
              <span className="font-medium">{detectedBy?.name ?? 'Unknown user'}</span>
              <span className="text-xs text-zinc-400">{detectedBy?.role ?? '—'}</span>
            </div>
          </InfoCard>
          <InfoCard label="Assigned Technician">
            <div className="flex flex-col">
              <span className="font-medium">{assignedTechnicianUser?.name ?? 'Unassigned'}</span>
              <span className="text-xs text-zinc-400">{assignedTechnicianUser?.email ?? '—'}</span>
            </div>
          </InfoCard>
          <InfoCard label="Stage">{stageLabel(request.stage)}</InfoCard>
          {request.request_type === 'preventive' && request.scheduled_date ? (
            <InfoCard label="Scheduled Date">{formatDate(request.scheduled_date, 'yyyy-MM-dd')}</InfoCard>
          ) : (
            <InfoCard label="Scheduled Date">—</InfoCard>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-[#0f1419] border border-zinc-800 rounded-xl p-5 shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Actions</h2>
              <div className="text-xs text-zinc-500">Role-aware controls</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionButton onClick={handleAssignSelf} disabled={!canAssignSelf}>
                Assign to Me
              </ActionButton>
              <ActionButton onClick={() => handleStageChange('in_progress')} disabled={!canMarkInProgress}>
                Mark as In Progress
              </ActionButton>
              <ActionButton onClick={() => handleStageChange('repaired')} disabled={!canMarkRepaired}>
                Mark as Repaired
              </ActionButton>
              <ActionButton onClick={() => handleStageChange('scrap')} disabled={!canScrap}>
                Move to Scrap
              </ActionButton>
              <ActionButton onClick={() => setShowTimeLogModal(true)} disabled={!canLogTime}>
                Log Time
              </ActionButton>
            </div>

            {canReassign && (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.12em] text-zinc-500 mb-2">Reassign technician</label>
                  <select
                    value={reassignTechnicianId}
                    onChange={(e) => setReassignTechnicianId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="">Unassigned</option>
                    {techniciansData.map((tech) => {
                      const techUser = usersData.find((u) => u.id === tech.user_id);
                      return (
                        <option key={tech.id} value={tech.id}>
                          {techUser?.name ?? 'Technician'}
                        </option>
                      );
                    })}
                  </select>
                  <div className="mt-2 flex justify-end">
                    <ActionButton onClick={handleReassign} disabled={false}>
                      Save Assignment
                    </ActionButton>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.12em] text-zinc-500 mb-2">Override stage</label>
                  <div className="flex gap-3">
                    <select
                      value={overrideStage}
                      onChange={(e) => setOverrideStage(e.target.value as RequestStage)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      {stageOrder.map((stage) => (
                        <option key={stage} value={stage}>
                          {stageLabel(stage)}
                        </option>
                      ))}
                    </select>
                    <ActionButton onClick={handleOverrideStage} disabled={false}>
                      Apply
                    </ActionButton>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#0f1419] border border-zinc-800 rounded-xl p-5 shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Time Logs</h2>
              <div className="text-xs text-zinc-500">Captured effort</div>
            </div>
            {timeLogs.length === 0 ? (
              <div className="text-sm text-zinc-500 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-lg p-4">
                No time has been logged yet.
              </div>
            ) : (
              <div className="space-y-3">
                {timeLogs
                  .slice()
                  .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())
                  .map((log) => {
                    const tech = techniciansData.find((t) => t.id === log.technician_id);
                    const user = tech ? usersData.find((u) => u.id === tech.user_id) : null;
                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800 rounded-lg px-4 py-3"
                      >
                        <div>
                          <div className="font-medium">{user?.name ?? 'Unknown technician'}</div>
                          <div className="text-xs text-zinc-500">{formatDate(log.logged_at)}</div>
                        </div>
                        <div className="text-sm font-semibold text-emerald-300">{log.hours_spent} hrs</div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] border border-zinc-800 rounded-xl p-5 shadow-lg shadow-black/30">
            <h3 className="text-sm uppercase tracking-[0.14em] text-zinc-500">Lifecycle</h3>
            <ol className="mt-3 space-y-2">
              {stageOrder.map((stage) => (
                <li
                  key={stage}
                  className={`flex items-center gap-3 p-3 rounded-md border ${
                    request.stage === stage ? 'border-sky-500 bg-sky-500/10' : 'border-zinc-800 bg-zinc-900/30'
                  }`}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{stageLabel(stage)}</div>
                    <div className="text-xs text-zinc-500">
                      {stage === 'new' && 'Request created'}
                      {stage === 'in_progress' && 'Work has started'}
                      {stage === 'repaired' && 'Resolved and verified'}
                      {stage === 'scrap' && 'Moved to scrap / decommissioned'}
                    </div>
                  </div>
                  {request.stage === stage && (
                    <span className="text-xs text-emerald-300">Current</span>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-[#0f1419] border border-zinc-800 rounded-xl p-5 shadow-lg shadow-black/30">
            <h3 className="text-sm uppercase tracking-[0.14em] text-zinc-500 mb-3">Linked Equipment</h3>
            <div className="space-y-2">
              <div className="text-lg font-semibold text-white">{equipment?.name ?? 'Unknown equipment'}</div>
              <div className="text-sm text-zinc-400">Serial: {equipment?.serial_number ?? '—'}</div>
              <div className="text-sm text-zinc-400">Location: {equipment?.location ?? '—'}</div>
              <Link
                href={equipment ? `/dashboard/equipment/${equipment.id}` : '#'}
                className="inline-flex text-sm text-sky-300 hover:text-sky-200"
              >
                View equipment
              </Link>
            </div>
          </div>
        </div>
      </div>

      <TimeLogModal
        open={showTimeLogModal}
        onClose={() => setShowTimeLogModal(false)}
        onSave={handleTimeLogSave}
      />
    </div>
  );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0f1419] border border-zinc-800 rounded-lg p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-zinc-500 mb-1">{label}</p>
      <div className="text-sm text-zinc-100">{children}</div>
    </div>
  );
}

function ActionButton({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors shadow-inner shadow-black/20 ${
        disabled
          ? 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
          : 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white border-sky-500 hover:from-sky-500 hover:to-indigo-500'
      }`}
    >
      {children}
    </button>
  );
}

function TimeLogModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (hours: number) => void }) {
  const [hours, setHours] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setHours('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0f1419] border border-zinc-800 rounded-xl p-6 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Log Time</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 text-sm">Close</button>
        </div>
        <label className="block text-sm text-zinc-200 mb-2">Hours spent</label>
        <input
          type="number"
          min="0"
          step="0.25"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
          placeholder="e.g., 2.5"
        />
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const numeric = parseFloat(hours);
              if (Number.isNaN(numeric) || numeric <= 0) {
                setError('Enter a positive number of hours.');
                return;
              }
              onSave(numeric);
            }}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-500 hover:from-emerald-500 hover:to-teal-500"
          >
            Save Log
          </button>
        </div>
      </div>
    </div>
  );
}
