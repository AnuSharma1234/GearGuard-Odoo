'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import StatusBadge from '@/components/dashboard/StatusBadge';

// Import dummy data
import maintenanceRequestsData from '@/data/maintenance_requests.json';
import equipmentData from '@/data/equipment.json';
import techniciansData from '@/data/technicians.json';
import usersData from '@/data/users.json';

// Types based on schema.txt
type Stage = 'new' | 'in_progress' | 'repaired' | 'scrap';

interface MaintenanceRequest {
  id: string;
  subject: string;
  description: string;
  request_type: 'corrective' | 'preventive';
  equipment_id: string;
  detected_by: string;
  assigned_to: string | null;
  scheduled_date: string;
  stage: Stage;
  overdue: boolean;
  created_at: string;
}

interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  category: string;
  status: string;
}

interface Technician {
  id: string;
  user_id: string;
  team_id: string;
  is_active: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'user';
  is_active: boolean;
}

// Enriched card data with joins
interface KanbanCard extends MaintenanceRequest {
  equipmentName: string;
  technicianName: string;
}

// Define columns based on schema.txt stage enum
const COLUMNS: { stage: Stage; label: string }[] = [
  { stage: 'new', label: 'New' },
  { stage: 'in_progress', label: 'In Progress' },
  { stage: 'repaired', label: 'Repaired' },
  { stage: 'scrap', label: 'Scrap' },
];

export default function KanbanPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Local state for requests (simulates optimistic updates)
  const [requests, setRequests] = useState<KanbanCard[]>([]);
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);

  // Load and join data on mount
  useEffect(() => {
    const enrichedRequests = (maintenanceRequestsData as MaintenanceRequest[]).map((req) => {
      // Join with equipment
      const equipment = (equipmentData as Equipment[]).find((e) => e.id === req.equipment_id);
      const equipmentName = equipment?.name || 'Unknown Equipment';

      // Join with technician → user
      let technicianName = 'Unassigned';
      if (req.assigned_to) {
        const technician = (techniciansData as Technician[]).find((t) => t.id === req.assigned_to);
        if (technician) {
          const techUser = (usersData as User[]).find((u) => u.id === technician.user_id);
          technicianName = techUser?.name || 'Unknown Technician';
        }
      }

      return {
        ...req,
        equipmentName,
        technicianName,
      };
    });

    // Sort by created_at ASC
    enrichedRequests.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    setRequests(enrichedRequests);
  }, []);

  // Role-based permissions
  const canDragToStage = (targetStage: Stage): boolean => {
    if (!user) return false;

    const role = user.role;

    // Regular users cannot drag
    if (role === 'user') return false;

    // Technicians can move cards between: new → in_progress → repaired (but NOT to scrap)
    if (role === 'technician') {
      return targetStage !== 'scrap';
    }

    // Managers and admins can move to any stage
    if (role === 'manager' || role === 'admin') {
      return true;
    }

    return false;
  };

  // Drag handlers
  const handleDragStart = (card: KanbanCard) => {
    if (user?.role === 'user') return; // Prevent drag for regular users
    setDraggedCard(card);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStage: Stage) => {
    if (!draggedCard) return;

    // Check permission
    if (!canDragToStage(targetStage)) {
      alert(`You don't have permission to move cards to "${targetStage}"`);
      setDraggedCard(null);
      return;
    }

    // Optimistic update
    setRequests((prev) =>
      prev.map((req) =>
        req.id === draggedCard.id
          ? { ...req, stage: targetStage }
          : req
      )
    );

    setDraggedCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  // Navigate to request detail
  const handleCardClick = (id: string) => {
    router.push(`/dashboard/requests/${id}`);
  };

  // Group requests by stage
  const groupedRequests: Record<Stage, KanbanCard[]> = {
    new: requests.filter((r) => r.stage === 'new'),
    in_progress: requests.filter((r) => r.stage === 'in_progress'),
    repaired: requests.filter((r) => r.stage === 'repaired'),
    scrap: requests.filter((r) => r.stage === 'scrap'),
  };

  return (
    <div className="p-6 bg-zinc-900 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Maintenance Kanban Board</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Visualize and manage maintenance requests through their lifecycle
        </p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((column) => {
          const cards = groupedRequests[column.stage];
          const count = cards.length;

          return (
            <div
              key={column.stage}
              className="border border-zinc-800 rounded-lg flex flex-col"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.stage)}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-zinc-100 uppercase tracking-wide">
                    {column.label}
                  </h2>
                  <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                    {count}
                  </span>
                </div>
              </div>

              {/* Column Body - Scrollable */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
                {cards.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-sm">
                    No requests in this stage
                  </div>
                ) : (
                  cards.map((card) => (
                    <div
                      key={card.id}
                      draggable={user?.role !== 'user'}
                      onDragStart={() => handleDragStart(card)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleCardClick(card.id)}
                      className={`
                        bg-zinc-800 border rounded-lg p-4 cursor-pointer
                        transition-all hover:bg-zinc-700 hover:border-zinc-600
                        ${card.overdue ? 'border-red-600 border-2' : 'border-zinc-700'}
                        ${draggedCard?.id === card.id ? 'opacity-50' : ''}
                        ${user?.role !== 'user' ? 'hover:shadow-lg' : ''}
                      `}
                    >
                      {/* Overdue Indicator */}
                      {card.overdue && (
                        <div className="flex items-center gap-1 mb-2">
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs font-medium text-red-500">Overdue</span>
                        </div>
                      )}

                      {/* Subject */}
                      <h3 className="text-sm font-medium text-zinc-100 mb-2 line-clamp-2">
                        {card.subject}
                      </h3>

                      {/* Equipment Name */}
                      <div className="text-xs text-zinc-400 mb-2">
                        <span className="font-medium">Equipment:</span> {card.equipmentName}
                      </div>

                      {/* Assigned Technician */}
                      <div className="text-xs text-zinc-400 mb-3">
                        <span className="font-medium">Assigned to:</span>{' '}
                        <span className={card.assigned_to ? 'text-zinc-300' : 'text-zinc-500 italic'}>
                          {card.technicianName}
                        </span>
                      </div>

                      {/* Stage Badge */}
                      <div className="flex items-center justify-between">
                        <StatusBadge stage={card.stage} />
                        <span className="text-xs text-zinc-500">
                          {new Date(card.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Info - Debug Helper */}
      {user && (
        <div className="mt-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400">
          <span className="font-medium text-zinc-300">Your Role:</span> {user.role}
          {user.role === 'user' && (
            <span className="ml-2 text-amber-400">(Read-only view)</span>
          )}
          {user.role === 'technician' && (
            <span className="ml-2 text-amber-400">(Can move: New → In Progress → Repaired)</span>
          )}
          {(user.role === 'manager' || user.role === 'admin') && (
            <span className="ml-2 text-emerald-400">(Can move to any stage)</span>
          )}
        </div>
      )}
    </div>
  );
}
