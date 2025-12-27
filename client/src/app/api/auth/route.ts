import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  // This is a proxy route if needed
  // For now, auth is handled client-side via apiClient
  return NextResponse.json({ message: 'Use client-side auth' });
}

