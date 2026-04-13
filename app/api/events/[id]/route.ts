import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/server/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
 * GET /api/events/:id
 * Fetches a single event by id plus its coordinators.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing event id.' }, { status: 400 });
    }

    const supabase = createSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase credentials are not configured.' },
        { status: 500 }
      );
    }

    const [eventResult, coordinatorsResult] = await Promise.all([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase
        .from('event_coordinators')
        .select('*')
        .eq('event_id', id)
        .order('name', { ascending: true }),
    ]);

    if (eventResult.error) {
      const status = eventResult.error.code === 'PGRST116' ? 404 : 500;
      return NextResponse.json({ error: eventResult.error.message }, { status });
    }

    if (coordinatorsResult.error) {
      console.error(
        '[/api/events/:id] Coordinators error:',
        coordinatorsResult.error.message
      );
    }

    const eventRow = (eventResult.data ?? {}) as Record<string, unknown>;
    const coordinators = (coordinatorsResult.data ?? []) as Array<Record<string, unknown>>;

    return NextResponse.json({
      event: {
        ...eventRow,
        perks: normalisePerks(eventRow.perks),
      },
      coordinators,
    });
  } catch (error) {
    console.error('[/api/events/:id] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event', message: String(error) },
      { status: 500 }
    );
  }
}
