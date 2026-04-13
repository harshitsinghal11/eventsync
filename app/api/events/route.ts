import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/server/supabase';

function normalisePerks(rawPerks: unknown): string[] {
  if (Array.isArray(rawPerks)) {
    return rawPerks.map((perk) => String(perk).trim()).filter(Boolean);
  }

  if (typeof rawPerks === 'string') {
    return rawPerks
      .split(',')
      .map((perk) => perk.trim())
      .filter(Boolean);
  }

  return [];
}

/**
 * GET /api/events
 * Fetches all rows from the `events` table in Supabase.
 * Ordered by date ascending.
 */
export async function GET() {
  try {
    const supabase = createSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase credentials are not configured.' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('[/api/events] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as Array<Record<string, unknown>>;
    const events = rows.map((eventRow) => ({
      ...eventRow,
      perks: normalisePerks(eventRow.perks),
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('[/api/events] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', message: String(error) },
      { status: 500 }
    );
  }
}
