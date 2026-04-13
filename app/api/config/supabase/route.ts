import { NextResponse } from 'next/server';
import { readSupabaseCredentials } from '@/lib/server/supabase';

/**
 * GET /api/config/supabase
 * Safely exposes the Supabase public URL and anon key to the frontend.
 * These are public-facing credentials and can be used in browser clients.
 */
export async function GET() {
  try {
    const credentials = readSupabaseCredentials();

    if (!credentials) {
      return NextResponse.json(
        { error: 'Supabase credentials are not configured.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: credentials.url,
      anonKey: credentials.anonKey,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load Supabase config', message: String(error) },
      { status: 500 }
    );
  }
}
