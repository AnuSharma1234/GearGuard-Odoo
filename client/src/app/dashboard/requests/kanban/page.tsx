'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import StatusBadge from '@/components/dashboard/StatusBadge';

// Types based on API response
type Stage = 'new' | 'in_progress' | 'repaired' | 'scrap';

// Enriched card data - matches MaintenanceRequestDetailResponse from backend
interface KanbanCard {
  id: string;
  subject: string;
  description: string | null;
  request_type: 'corrective' | 'preventive';
  equipment_id: string;
  equipment_name: string;
  equipment_category: string;
  equipment_location: string;
  detected_by: string;
  detected_by_name: string;
  assigned_to: string | null;
  assigned_to_name: string | null;
  maintenance_team_id: string;
  maintenance_team_name: string;
  scheduled_date: string | null;
  stage: Stage;
  overdue: boolean;
  is_overdue: boolean;
  created_at: string;
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

  // Fetch maintenance requests from API
  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: () => apiClient.getMaintenanceRequests(),
  });

  // Local state for requests (for optimistic updates when dragging)
  const [requests, setRequests] = useState<KanbanCard[]>([]);
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);

  // Update local state when API data loads
  useEffect(() => {
    if (requestsData) {
      // Transform API response to KanbanCard format
      const enrichedRequests: KanbanCard[] = requestsData.map((req: any) => ({
        id: req.id,
        subject: req.subject,
        description: req.description,
        request_type: req.request_type,
        equipment_id: req.equipment_id,
        equipment_name: req.equipment_name,
        equipment_category: req.equipment_category,
        equipment_location: req.equipment_location,
        detected_by: req.detected_by,
        detected_by_name: req.detected_by_name,
        assigned_to: req.assigned_to,
        assigned_to_name: req.assigned_to_name || 'Unassigned',
        maintenance_team_id: req.maintenance_team_id,
        maintenance_team_name: req.maintenance_team_name,
        scheduled_date: req.scheduled_date,
        stage: req.stage,
        overdue: req.overdue,
        is_overdue: req.is_overdue,
        created_at: req.created_at,
      }));

      // Sort by created_at ASC
      enrichedRequests.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      setRequests(enrichedRequests);
    }
  }, [requestsData]);

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

  const handleDrop = async (targetStage: Stage) => {
    if (!draggedCard) return;

    // Check permission
    if (!canDragToStage(targetStage)) {
      alert(`You don't have permission to move cards to "${targetStage}"`);
      setDraggedCard(null);
      return;
    }

    // Optimistic update
    const originalStage = draggedCard.stage;
    setRequests((prev) =>
      prev.map((req) =>
        req.id === draggedCard.id
          ? { ...req, stage: targetStage }
          : req
      )
    );

    setDraggedCard(null);

    // Update on backend
    try {
      await apiClient.updateRequestStage(draggedCard.id, targetStage);
    } catch (error) {
      // Revert optimistic update on error
      setRequests((prev) =>
        prev.map((req) =>
          req.id === draggedCard.id
            ? { ...req, stage: originalStage }
            : req
        )
      );
      alert('Failed to update request stage. Please try again.');
    }
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
                {isLoading ? (
                  <div className="text-center py-8 text-zinc-500 text-sm">
                    Loading...
                  </div>
                ) : cards.length === 0 ? (
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
                      {card.is_overdue && (
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
                        <span className="font-medium">Equipment:</span> {card.equipment_name}
                      </div>

                      {/* Assigned Technician */}
                      <div className="text-xs text-zinc-400 mb-3">
                        <span className="font-medium">Assigned to:</span>{' '}
                        <span className={card.assigned_to ? 'text-zinc-300' : 'text-zinc-500 italic'}>
                          {card.assigned_to_name || 'Unassigned'}
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
