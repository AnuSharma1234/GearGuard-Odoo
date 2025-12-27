'use client';

import { useParams } from 'next/navigation';

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;

  return (
    <div>
      <h1>Request Detail</h1>
      <p>Request ID: {requestId}</p>
      <p>Request detail page - to be implemented</p>
    </div>
  );
}
