'use client';

import { useParams, notFound } from 'next/navigation';

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;

  // Redirect to proper routes if accessing special paths
  if (requestId === 'calendar' || requestId === 'kanban') {
    notFound();
    return null;
  }

  return (
    <div>
      <h1>Request Detail</h1>
      <p>Request ID: {requestId}</p>
      <p>Request detail page - to be implemented</p>
    </div>
  );
}
