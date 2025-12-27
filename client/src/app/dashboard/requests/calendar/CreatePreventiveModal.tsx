'use client';

import { useState } from 'react';
import { generateRequestId } from './calendarHelpers';

// Types for modal props
interface Equipment {
  id: string;
  name: string;
  maintenance_team_id: string;
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
  role: string;
}

interface CreatePreventiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRequest: (request: any) => void;
  prefilledDate: string; // ISO date (YYYY-MM-DD)
  equipment: Equipment[];
  technicians: Technician[];
  users: User[];
}

/**
 * Modal for creating a new preventive maintenance request
 *
 * Features:
 * - Equipment selection (required)
 * - Subject/description field (required)
 * - Scheduled date (pre-filled, editable)
 * - Automatic technician team derivation from equipment
 * - Form validation
 * - Keyboard accessibility (Escape to close)
 */
export function CreatePreventiveModal({
  isOpen,
  onClose,
  onCreateRequest,
  prefilledDate,
  equipment,
  technicians,
  users,
}: CreatePreventiveModalProps) {
  // Form state
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(prefilledDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Get maintenance team for selected equipment
  const selectedEquipment = equipment.find((eq) => eq.id === selectedEquipmentId);
  const maintenanceTeamId = selectedEquipment?.maintenance_team_id;

  // Get technicians for the equipment's team
  const availableTechnicians = technicians.filter(
    (tech) => tech.team_id === maintenanceTeamId && tech.is_active
  );

  // Map technician IDs to user names
  const technicianMap = new Map<string, string>();
  availableTechnicians.forEach((tech) => {
    const user = users.find((u) => u.id === tech.user_id);
    if (user) {
      technicianMap.set(tech.id, user.name);
    }
  });

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedEquipmentId) {
      newErrors.equipment = 'Equipment is required';
    }

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Create new request object
      const newRequest = {
        id: generateRequestId(),
        subject: subject.trim(),
        description: '',
        request_type: 'preventive',
        equipment_id: selectedEquipmentId,
        detected_by: 'system-generated', // Would be current user in real app
        assigned_to: null, // Could be assigned later
        scheduled_date: scheduledDate,
        stage: 'new',
        overdue: false,
        created_at: new Date().toISOString(),
      };

      // Notify parent component
      onCreateRequest(newRequest);

      // Reset form
      setSubject('');
      setSelectedEquipmentId('');
      setScheduledDate(prefilledDate);
      setErrors({});
    } catch (error) {
      console.error('Error creating request:', error);
      setErrors({ submit: 'Failed to create request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setSubject('');
    setSelectedEquipmentId('');
    setScheduledDate(prefilledDate);
    setErrors({});
    onClose();
  };

  /**
   * Handle keyboard events (Escape to close)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      {/* Modal backdrop - close on click outside */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
        aria-hidden="true"
      ></div>

      {/* Modal content */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="border-b border-gray-700 px-6 py-5 flex justify-between items-center bg-gradient-to-r from-gray-850 to-gray-900">
          <div>
            <h2
              id="modal-title"
              className="text-2xl font-bold text-gray-100"
            >
              Create Preventive Maintenance
            </h2>
            <p className="text-gray-400 text-sm mt-1">Schedule new preventive maintenance task</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-200 hover:bg-gray-800 p-2 rounded-lg transition-all"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Submission error */}
          {errors.submit && (
            <div className="p-4 bg-red-900 bg-opacity-20 border-l-4 border-red-500 rounded text-red-300 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Equipment Selection */}
          <div>
            <label htmlFor="equipment" className="block text-sm font-bold text-gray-300 mb-2">
              Equipment <span className="text-red-400">*</span>
            </label>
            <select
              id="equipment"
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
              className={`
                w-full px-4 py-3 bg-gray-800 border rounded-lg text-gray-100
                focus:outline-none focus:ring-2 transition-all
                ${
                  errors.equipment
                    ? 'border-red-600 focus:ring-red-500'
                    : 'border-gray-700 focus:ring-blue-500'
                }
              `}
              disabled={isSubmitting}
            >
              <option value="">Select equipment...</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name}
                </option>
              ))}
            </select>
            {errors.equipment && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.equipment}
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-bold text-gray-300 mb-2">
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Bearing replacement and lubrication"
              className={`
                w-full px-4 py-3 bg-gray-800 border rounded-lg text-gray-100 placeholder-gray-500
                focus:outline-none focus:ring-2 transition-all
                ${
                  errors.subject
                    ? 'border-red-600 focus:ring-red-500'
                    : 'border-gray-700 focus:ring-blue-500'
                }
              `}
              disabled={isSubmitting}
            />
            {errors.subject && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.subject}
              </p>
            )}
          </div>

          {/* Scheduled Date */}
          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-bold text-gray-300 mb-2">
              Scheduled Date <span className="text-red-400">*</span>
            </label>
            <input
              id="scheduledDate"
              type="date"
              value={scheduledDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setScheduledDate(e.target.value)}
              className={`
                w-full px-4 py-3 bg-gray-800 border rounded-lg text-gray-100
                focus:outline-none focus:ring-2 transition-all
                ${
                  errors.scheduledDate
                    ? 'border-red-600 focus:ring-red-500'
                    : 'border-gray-700 focus:ring-blue-500'
                }
              `}
              disabled={isSubmitting}
            />
            {errors.scheduledDate && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.scheduledDate}
              </p>
            )}
          </div>

          {/* Maintenance Team Info (Read-only) */}
          {selectedEquipment && (
            <div className="p-4 bg-blue-900 bg-opacity-10 border border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 bg-opacity-20 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-300 uppercase mb-1">Team Assignment</p>
                  <p className="text-sm text-gray-300">
                    {maintenanceTeamId && availableTechnicians.length > 0
                      ? `${availableTechnicians.length} technician${availableTechnicians.length > 1 ? 's' : ''} available`
                      : 'No technicians available'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Technician assignment can be updated after creation
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-all disabled:opacity-50 font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 font-bold shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
