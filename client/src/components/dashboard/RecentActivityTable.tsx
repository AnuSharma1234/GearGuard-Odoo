'use client';

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/dashboard/StatusBadge';

interface MaintenanceRequest {
  id: string;
  subject: string;
  equipment_name: string;
  technician_name: string;
  stage: string;
  created_at: string;
}

export default function RecentActivityTable({ requests }: { requests: MaintenanceRequest[] }) {
  const router = useRouter();

  return (
    <table className="w-full text-sm">
      <thead className="bg-zinc-900 text-zinc-300">
        <tr>
          <Th>Subject</Th>
          <Th>Equipment</Th>
          <Th>Stage</Th>
          <Th>Technician</Th>
          <Th>Created</Th>
        </tr>
      </thead>
      <tbody>
        {requests.map((r) => (
          <tr 
            key={r.id} 
            className="border-t border-zinc-800 hover:bg-zinc-900/50 cursor-pointer"
            onClick={() => router.push(`/dashboard/requests/${r.id}/edit`)}
          >
            <Td>
              <div className="text-sky-300 hover:text-sky-200">
                {r.subject}
              </div>
            </Td>
            <Td>{r.equipment_name}</Td>
            <Td>
              <StatusBadge stage={r.stage} />
            </Td>
            <Td>{r.technician_name}</Td>
            <Td>{format(new Date(r.created_at), 'yyyy-MM-dd HH:mm')}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top text-zinc-200">{children}</td>;
}

