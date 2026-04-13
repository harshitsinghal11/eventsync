import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/server/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CoordinatorInput = {
  name?: unknown;
  phone?: unknown;
};

type EventUpdatePayload = {
  title?: unknown;
  description?: unknown;
  date?: unknown;
  time?: unknown;
  venue?: unknown;
  duration?: unknown;
  category?: unknown;
  perks?: unknown;
  registration_link?: unknown;
  coordinators?: unknown;
};

/**
 * PUT /api/admin/events/:id
 */
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing event id.' }, { status: 400 });
    }

    let payload: EventUpdatePayload;

    try {
      payload = (await request.json()) as EventUpdatePayload;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const title = typeof payload.title === 'string' ? payload.title.trim() : '';

    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    const supabase = createSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase credentials are not configured.' },
        { status: 500 }
      );
    }

    const perksText = Array.isArray(payload.perks)
      ? payload.perks.map((perk) => String(perk).trim()).filter(Boolean).join(', ')
      : (payload.perks ?? null);

    const { error: updateError } = await supabase
      .from('events')
      .update({
        title,
        description: payload.description ?? null,
        date: payload.date ?? null,
        time: payload.time ?? null,
        venue: payload.venue ?? null,
        duration: payload.duration ?? null,
        category: payload.category ?? null,
        perks: perksText,
        registration_link: payload.registration_link ?? null,
      })
      .eq('id', id);

    if (updateError) {
      console.error('[admin/events PUT] update error:', updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: deleteError } = await supabase
      .from('event_coordinators')
      .delete()
      .eq('event_id', id);

    if (deleteError) {
      console.error('[admin/events PUT] coordinator delete error:', deleteError.message);
      return NextResponse.json(
        { error: `Event updated but failed to clear old coordinators: ${deleteError.message}` },
        { status: 500 }
      );
    }

    const rawCoordinators = Array.isArray(payload.coordinators)
      ? (payload.coordinators as CoordinatorInput[])
      : [];

    const validCoordinators = rawCoordinators
      .map((coordinator) => ({
        name: typeof coordinator.name === 'string' ? coordinator.name.trim() : '',
        phone:
          typeof coordinator.phone === 'string' && coordinator.phone.trim().length > 0
            ? coordinator.phone.trim()
            : null,
      }))
      .filter((coordinator) => coordinator.name.length > 0);

    if (validCoordinators.length > 0) {
      const rows = validCoordinators.map((coordinator) => ({
        event_id: id,
        name: coordinator.name,
        phone: coordinator.phone,
      }));

      const { error: insertError } = await supabase
        .from('event_coordinators')
        .insert(rows);

      if (insertError) {
        console.error('[admin/events PUT] coordinator insert error:', insertError.message);
        return NextResponse.json({
          success: true,
          warning: `Event updated but coordinators failed to save: ${insertError.message}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      coordinatorsUpdated: validCoordinators.length,
    });
  } catch (error) {
    console.error('[admin/events PUT] unexpected:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/events/:id
 */
export async function DELETE(_request: Request, { params }: RouteContext) {
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

    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) {
      console.error('[admin/events DELETE] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
