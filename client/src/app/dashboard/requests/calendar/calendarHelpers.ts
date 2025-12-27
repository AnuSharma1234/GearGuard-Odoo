/**
 * Calendar helper functions for preventive maintenance scheduling
 */

// Type for maintenance request from dummy data
interface MaintenanceRequest {
  id: string;
  subject: string;
  description?: string;
  request_type: 'corrective' | 'preventive';
  equipment_id: string;
  detected_by: string;
  assigned_to?: string | null;
  scheduled_date?: string;
  stage: 'new' | 'in_progress' | 'repaired' | 'scrap';
  overdue: boolean;
  created_at: string;
}

// Type for calendar events
interface CalendarEvent {
  id: string;
  equipmentName: string;
  subject: string;
  technicianName?: string;
  date: string;
  isOverdue: boolean;
  stage: string;
}

/**
 * Filter maintenance requests to only include preventive requests with scheduled dates
 *
 * Criteria:
 * - request_type === 'preventive'
 * - scheduled_date is not null/empty
 *
 * @param requests - Array of maintenance requests from dummy data
 * @returns Filtered array of preventive requests with scheduled dates
 */
export function filterPreventiveRequests(requests: MaintenanceRequest[]): MaintenanceRequest[] {
  return requests.filter((request) => {
    return request.request_type === 'preventive' && request.scheduled_date;
  });
}

/**
 * Group calendar events by date for efficient lookup
 *
 * @param events - Array of calendar events
 * @returns Object mapping ISO date strings to arrays of events
 */
export function groupRequestsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  return events.reduce(
    (acc, event) => {
      if (!acc[event.date]) {
        acc[event.date] = [];
      }
      // Sort by equipment name for consistent display
      acc[event.date].push(event);
      acc[event.date].sort((a, b) => a.equipmentName.localeCompare(b.equipmentName));
      return acc;
    },
    {} as Record<string, CalendarEvent[]>
  );
}

/**
 * Determine if a maintenance request is overdue
 *
 * Criteria for overdue:
 * - scheduled_date < today (in the past)
 * - AND stage !== 'repaired' (has not been completed)
 *
 * @param scheduledDate - ISO date string (YYYY-MM-DD)
 * @param stage - Current stage of the maintenance request
 * @returns True if the request is overdue
 */
export function isDateOverdue(scheduledDate: string, stage: string): boolean {
  // If already repaired, not overdue
  if (stage === 'repaired') {
    return false;
  }

  // Parse scheduled date
  const scheduled = new Date(scheduledDate);
  const today = new Date();

  // Set time to midnight for date-only comparison
  scheduled.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Overdue if scheduled date is in the past
  return scheduled < today;
}

/**
 * Format a date string for display in the calendar
 *
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "Dec 30")
 */
export function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get the day name for a given date
 *
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @returns Day name (e.g., "Monday")
 */
export function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Check if a date is today
 *
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @returns True if the date is today
 */
export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Generate a unique ID for a new maintenance request
 * (Simulates UUID generation for frontend-only creation)
 *
 * @returns A pseudo-random UUID
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sort calendar events by scheduled date
 *
 * @param events - Array of calendar events
 * @returns Sorted array (earliest first)
 */
export function sortEventsByDate(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });
}

/**
 * Get the number of events on a given date
 *
 * @param events - Array of calendar events
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @returns Count of events on that date
 */
export function getEventCountForDate(events: CalendarEvent[], dateStr: string): number {
  return events.filter((event) => event.date === dateStr).length;
}

/**
 * Get the next scheduled maintenance date
 *
 * @param events - Array of calendar events
 * @returns ISO date string of the next scheduled date, or null if none
 */
export function getNextScheduledDate(events: CalendarEvent[]): string | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  if (upcomingEvents.length === 0) {
    return null;
  }

  const sorted = sortEventsByDate(upcomingEvents);
  return sorted[0].date;
}

/**
 * Get all overdue events
 *
 * @param events - Array of calendar events
 * @returns Array of overdue events
 */
export function getOverdueEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((event) => event.isOverdue);
}
