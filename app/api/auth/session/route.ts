import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/server/auth';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'No active session.' }, { status: 401 });
  }

  return NextResponse.json({ session });
}
