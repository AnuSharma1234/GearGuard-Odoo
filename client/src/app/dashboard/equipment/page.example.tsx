'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEquipment, useDepartments, useDeleteEquipment } from '@/hooks/useApi';
import { useAuthStore } from '@/store/authStore';
import { LoadingScreen, LoadingCard } from '@/components/common/Loading';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function EquipmentListPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch data with proper error handling
  const {
    data: equipment,
    isLoading: equipmentLoading,
    error: equipmentError,
    refetch: refetchEquipment,
  } = useEquipment({ search: searchQuery, category: selectedCategory || undefined });

  const {
    data: departments,
    isLoading: departmentsLoading,
  } = useDepartments();

  const deleteEquipmentMutation = useDeleteEquipment();

  // Loading state
  if (equipmentLoading && !equipment) {
    return <LoadingScreen message="Loading equipment..." />;
  }

  // Error state
  if (equipmentError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <ErrorMessage
          title="Failed to load equipment"
          message={equipmentError instanceof Error ? equipmentError.message : 'An error occurred'}
          onRetry={refetchEquipment}
        />
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    try {
      await deleteEquipmentMutation.mutateAsync(id);
      alert('Equipment deleted successfully');
    } catch (error: any) {
      alert(error?.detail || 'Failed to delete equipment');
    }
  };

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId || !departments) return 'N/A';
    const dept = departments.find((d: any) => d.id === departmentId);
    return dept?.name || 'N/A';
  };

  // Get unique categories for filter
  const categories = Array.from(new Set(equipment?.map((e: any) => e.category).filter(Boolean))) as string[];

  const canCreateEquipment = user?.role === 'admin' || user?.role === 'manager';
  const canDeleteEquipment = user?.role === 'admin';

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Equipment</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage all equipment and maintenance
          </p>
        </div>
        {canCreateEquipment && (
          <button
            onClick={() => router.push('/dashboard/equipment/new')}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-zinc-200 transition-colors"
          >
            New Equipment
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equipment..."
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-700 rounded text-white focus:outline-none focus:border-zinc-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      {equipmentLoading ? (
        <div className="grid grid-cols-1 gap-4">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </div>
      ) : equipment && equipment.length > 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {equipment.map((item: any) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/equipment/${item.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {item.name}
                        </div>
                        <div className="text-sm text-zinc-400">
                          {item.serial_number || 'No S/N'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-zinc-800 text-zinc-300">
                        {item.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {getDepartmentName(item.department_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {item.location || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'active'
                            ? 'bg-green-900/30 text-green-300 border border-green-800'
                            : item.status === 'maintenance'
                            ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800'
                            : 'bg-red-900/30 text-red-300 border border-red-800'
                        }`}
                      >
                        {item.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      <div>
                        <span className="font-medium">{item.open_request_count || 0}</span>
                        {' / '}
                        <span className="text-zinc-500">{item.request_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/equipment/${item.id}`);
                        }}
                        className="text-white hover:text-zinc-300 mr-3"
                      >
                        View
                      </button>
                      {canDeleteEquipment && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          disabled={deleteEquipmentMutation.isPending}
                          className="text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                          {deleteEquipmentMutation.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-12 text-center">
          <p className="text-zinc-400">No equipment found</p>
          {canCreateEquipment && (
            <button
              onClick={() => router.push('/dashboard/equipment/new')}
              className="mt-4 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-zinc-200 transition-colors"
            >
              Create First Equipment
            </button>
          )}
        </div>
      )}
    </div>
  );
}
