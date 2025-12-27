'use client';

import { useParams } from 'next/navigation';

export default function EquipmentDetailPage() {
  const params = useParams();
  const equipmentId = params.id as string;

  return (
    <div>
      <h1>Equipment Detail</h1>
      <p>Equipment ID: {equipmentId}</p>
      <p>Equipment detail page - to be implemented</p>
    </div>
  );
}
