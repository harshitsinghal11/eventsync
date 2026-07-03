import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/src/lib/server/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
