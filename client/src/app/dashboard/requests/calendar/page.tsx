'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { permissions } from '@/lib/permissions';
import maintenanceRequestsData from '../../../../../data/maintenance_requests.json';
import equipmentData from '../../../../../data/equipment.json';
import techniciansData from '../../../../../data/technicians.json';
import usersData from '../../../../../data/users.json';
import { CreatePreventiveModal } from './CreatePreventiveModal';
import {
  filterPreventiveRequests,
  groupRequestsByDate,
  isDateOverdue,
  formatDateForDisplay,
} from './calendarHelpers';

// Calendar event type
interface CalendarEvent {
  id: string;
  equipmentName: string;
  subject: string;
  technicianName?: string;
  date: string;
  isOverdue: boolean;
  stage: string;
}

// Month navigation type
interface MonthView {
  year: number;
  month: number;
}

export default function CalendarPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  // Calendar state
  const [monthView, setMonthView] = useState<MonthView>(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Events state (including simulated creates)
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);

  // Process and filter maintenance requests
  useEffect(() => {
    if (isLoading || !user) return;

    try {
      // Filter preventive maintenance requests with scheduled dates
      const preventiveRequests = filterPreventiveRequests(maintenanceRequestsData as any);

      // Map to calendar events with equipment and technician info
      const events = preventiveRequests
        .filter((request) => request.scheduled_date) // Ensure date exists
        .map((request) => {
          const equipment = equipmentData.find((eq) => eq.id === request.equipment_id);
          let technicianName: string | undefined;

          if (request.assigned_to) {
            const technician = techniciansData.find((t) => t.id === request.assigned_to);
            if (technician) {
              const user = usersData.find((u) => u.id === technician.user_id);
              if (user) {
                technicianName = user.name;
              }
            }
          }

          const isOverdue = isDateOverdue(request.scheduled_date as string, request.stage);

          return {
            id: request.id,
            equipmentName: equipment?.name || 'Unknown Equipment',
            subject: request.subject,
            technicianName,
            date: request.scheduled_date as string,
            isOverdue,
            stage: request.stage,
          };
        });

      setAllEvents(events);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  }, [user, isLoading]);

  // Permission checks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  // Access control: Only manager and admin can access
  if (!permissions.canSchedulePreventive(user.role)) {
    return (
      <div className="p-6">
        <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4">
          <h2 className="text-red-400 font-semibold">Access Denied</h2>
          <p className="text-gray-400 text-sm mt-2">
            Only managers and administrators can access the calendar.
          </p>
        </div>
      </div>
    );
  }

  // Get calendar days for the current month
  const calendarDays = getCalendarDays(monthView.year, monthView.month);
  const eventsByDate = groupRequestsByDate(allEvents);

  // Handle navigation
  const handlePrevMonth = () => {
    setMonthView((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setMonthView((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleToday = () => {
    const today = new Date();
    setMonthView({ year: today.getFullYear(), month: today.getMonth() });
  };

  // Handle date click to open create modal
  const handleDateClick = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent scheduling on past dates
    if (normalized < today) return;

    const dateStr = normalized.toISOString().split('T')[0]; // YYYY-MM-DD
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  // Handle event click to navigate to detail
  const handleEventClick = (eventId: string) => {
    router.push(`/dashboard/requests/${eventId}`);
  };

  // Handle new request creation (simulated)
  const handleCreateRequest = (newRequest: any) => {
    // Add the new event to the calendar state
    const equipment = equipmentData.find((eq) => eq.id === newRequest.equipment_id);
    const newEvent: CalendarEvent = {
      id: newRequest.id,
      equipmentName: equipment?.name || 'Unknown Equipment',
      subject: newRequest.subject,
      technicianName: undefined,
      date: newRequest.scheduled_date,
      isOverdue: false,
      stage: 'new',
    };

    setAllEvents((prev) => [...prev, newEvent]);
    setIsModalOpen(false);
  };

  // Render empty state
  if (allEvents.length === 0) {
    return (
      <div className="p-4 lg:p-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Maintenance Calendar</h1>
          <p className="text-gray-400">
            Schedule and track preventive maintenance across all equipment
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-900 to-gray-850 rounded-xl border border-gray-800 shadow-2xl">
          <div className="bg-gray-800 bg-opacity-50 rounded-full p-6 mb-6">
            <svg
              className="w-16 h-16 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">No Preventive Maintenance Scheduled</h3>
          <p className="text-gray-500 text-center mb-6 max-w-md">
            Get started by scheduling your first preventive maintenance task to keep your equipment running smoothly.
          </p>
          <button
            onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setIsModalOpen(true);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
          >
            Schedule Maintenance
          </button>
        </div>

        {isModalOpen && selectedDate && (
          <CreatePreventiveModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreateRequest={handleCreateRequest}
            prefilledDate={selectedDate}
            equipment={equipmentData}
            technicians={techniciansData}
            users={usersData}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Maintenance Calendar</h1>
        <p className="text-gray-400">
          Schedule and track preventive maintenance across all equipment
        </p>
      </div>

      {/* Calendar Container */}
      <div className="bg-[#0f121a] border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Month Navigation */}
        <div className="bg-gradient-to-r from-[#121722] to-[#0e1119] border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg transition-all hover:scale-105 font-medium border border-gray-700"
              aria-label="Previous month"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-100 min-w-64 text-center tracking-wide">
                {new Date(monthView.year, monthView.month).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
              <button
                onClick={handleToday}
                className="px-5 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-lg transition-all hover:scale-105 font-semibold shadow-lg border border-sky-600"
              >
                Today
              </button>
            </div>

            <button
              onClick={handleNextMonth}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg transition-all hover:scale-105 font-medium border border-gray-700"
              aria-label="Next month"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4 bg-[#0f121a]">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
              <div
                key={day}
                className="text-center text-gray-400 text-sm font-bold py-2 uppercase tracking-wider"
              >
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const dateStr = day ? new Date(monthView.year, monthView.month, day).toISOString().split('T')[0] : '';
              const dayEvents = dateStr ? eventsByDate[dateStr] || [] : [];
              const isCurrentMonth = day !== null;
              const isToday =
                day &&
                day === new Date().getDate() &&
                monthView.month === new Date().getMonth() &&
                monthView.year === new Date().getFullYear();

              return (
                <div
                  key={index}
                  onClick={() => day && isCurrentMonth && handleDateClick(new Date(monthView.year, monthView.month, day))}
                  className={`
                    min-h-24 border rounded-lg p-2 transition-all relative
                    ${isCurrentMonth 
                      ? 'bg-[#0c1017] border-gray-800 cursor-pointer hover:bg-[#111826] hover:border-gray-700 hover:shadow-lg' 
                      : 'bg-gray-950 border-gray-900 opacity-40'}
                    ${isToday ? 'ring-2 ring-sky-500 ring-offset-2 ring-offset-[#0f121a] shadow-xl' : ''}
                  `}
                >
                  {/* Date number */}
                  <div className={`text-sm font-bold mb-1 ${isToday ? 'text-sky-400' : isCurrentMonth ? 'text-gray-200' : 'text-gray-600'}`}>
                    {day}
                  </div>

                  {/* Events */}
                  <div className="space-y-1 overflow-y-auto max-h-16 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event.id);
                        }}
                        className={`
                          p-1.5 rounded-md cursor-pointer text-xs transition-all
                          ${
                            event.isOverdue
                              ? 'bg-red-900/40 border-l-4 border-red-500 text-red-200 hover:bg-red-900/60 hover:shadow-md'
                              : 'bg-sky-900/30 border-l-4 border-sky-500 text-sky-100 hover:bg-sky-900/45 hover:shadow-md'
                          }
                        `}
                      >
                        <div className="font-bold truncate leading-tight text-xs">{event.equipmentName}</div>
                        <div className="text-gray-400 truncate text-xs mt-0.5 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {event.technicianName || 'Unassigned'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Event count badge for multiple events */}
                  {dayEvents.length > 2 && (
                    <div className="absolute top-1 right-1 bg-sky-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {dayEvents.length}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-6 text-sm bg-[#0f121a] border border-gray-800 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-sky-900/40 border-l-4 border-sky-500 rounded"></div>
          <span className="text-gray-300 font-medium">Scheduled Maintenance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-900/40 border-l-4 border-red-500 rounded"></div>
          <span className="text-gray-300 font-medium">Overdue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 ring-2 ring-sky-500 rounded"></div>
          <span className="text-gray-300 font-medium">Today</span>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && selectedDate && (
        <CreatePreventiveModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreateRequest={handleCreateRequest}
          prefilledDate={selectedDate}
          equipment={equipmentData}
          technicians={techniciansData}
          users={usersData}
        />
      )}
    </div>
  );
}

/**
 * Generate calendar days array for the given month
 * Returns array of day numbers (1-31) and null for days from other months
 */
function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: (number | null)[] = [];

  // Previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(null);
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Next month's days to fill the grid
  const remainingCells = 42 - days.length; // 6 rows × 7 days
  for (let i = 1; i <= remainingCells; i++) {
    days.push(null);
  }

  return days;
}
