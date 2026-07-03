'use server';

import { getAdminSession } from '@/src/lib/server/auth';
import { createSupabaseClient } from '@/src/lib/server/supabase';
import {
  getOptionalTrimmedString,
  getRequiredFieldsError,
  getTrimmedString,
} from '@/src/lib/server/validation';
import type { Coordinator } from '@/src/types';

type EventPayload = {
  title?: unknown;
  description?: unknown;
  date?: unknown;
  time?: unknown;
  venue?: unknown;
  duration?: unknown;
  category?: unknown;
  perks?: unknown;
  registration_link?: unknown;
  coordinators?: Coordinator[];
};

export async function createEvent(payload: EventPayload) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const title = getTrimmedString(payload.title);
  const date = getTrimmedString(payload.date);
  const requiredFieldsError = getRequiredFieldsError({ title, date });
  if (requiredFieldsError) throw new Error(requiredFieldsError);

  const supabase = createSupabaseClient();
  if (!supabase) throw new Error('Supabase credentials are not configured.');

  const perksText = Array.isArray(payload.perks)
    ? payload.perks.map((perk) => String(perk).trim()).filter(Boolean).join(', ')
    : getOptionalTrimmedString(payload.perks);

  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert([{
      title,
      description: getOptionalTrimmedString(payload.description),
      date,
      time: getOptionalTrimmedString(payload.time),
      venue: getOptionalTrimmedString(payload.venue),
      duration: getOptionalTrimmedString(payload.duration),
      category: getOptionalTrimmedString(payload.category),
      perks: perksText || null,
      registration_link: getOptionalTrimmedString(payload.registration_link),
    }])
    .select('id')
    .single();

  if (eventError) throw new Error(eventError.message);

  const eventId = event.id;
  const rawCoordinators = Array.isArray(payload.coordinators) ? payload.coordinators : [];
  const validCoordinators = rawCoordinators
    .map((c: { name?: unknown; phone?: unknown }) => ({
      name: typeof c.name === 'string' ? c.name.trim() : '',
      phone: typeof c.phone === 'string' && c.phone.trim().length > 0 ? c.phone.trim() : null,
    }))
    .filter((c) => c.name.length > 0);

  if (validCoordinators.length > 0) {
    const rows = validCoordinators.map((c) => ({
      event_id: eventId,
      name: c.name,
      phone: c.phone,
    }));
    const { error: coordError } = await supabase.from('event_coordinators').insert(rows);
    if (coordError) throw new Error(`Event created but coordinators failed: ${coordError.message}`);
  }
  return { success: true, eventId };
}

export async function updateEvent(id: string, payload: EventPayload) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');
  if (!id) throw new Error('Missing event id');

  const title = getTrimmedString(payload.title);
  const date = getTrimmedString(payload.date);
  const requiredFieldsError = getRequiredFieldsError({ title, date });
  if (requiredFieldsError) throw new Error(requiredFieldsError);

  const supabase = createSupabaseClient();
  if (!supabase) throw new Error('Supabase credentials are not configured.');

  const perksText = Array.isArray(payload.perks)
    ? payload.perks.map((perk) => String(perk).trim()).filter(Boolean).join(', ')
    : getOptionalTrimmedString(payload.perks);

  const { error: updateError } = await supabase
    .from('events')
    .update({
      title,
      description: getOptionalTrimmedString(payload.description),
      date,
      time: getOptionalTrimmedString(payload.time),
      venue: getOptionalTrimmedString(payload.venue),
      duration: getOptionalTrimmedString(payload.duration),
      category: getOptionalTrimmedString(payload.category),
      perks: perksText || null,
      registration_link: getOptionalTrimmedString(payload.registration_link),
    })
    .eq('id', id);

  if (updateError) throw new Error(updateError.message);

  const { error: deleteError } = await supabase.from('event_coordinators').delete().eq('event_id', id);
  if (deleteError) throw new Error(`Failed to clear old coordinators: ${deleteError.message}`);

  const rawCoordinators = Array.isArray(payload.coordinators) ? payload.coordinators : [];
  const validCoordinators = rawCoordinators
    .map((c: { name?: unknown; phone?: unknown }) => ({
      name: typeof c.name === 'string' ? c.name.trim() : '',
      phone: typeof c.phone === 'string' && c.phone.trim().length > 0 ? c.phone.trim() : null,
    }))
    .filter((c) => c.name.length > 0);

  if (validCoordinators.length > 0) {
    const rows = validCoordinators.map((c) => ({
      event_id: id,
      name: c.name,
      phone: c.phone,
    }));
    const { error: insertError } = await supabase.from('event_coordinators').insert(rows);
    if (insertError) throw new Error(`Event updated but coordinators failed to save: ${insertError.message}`);
  }
  return { success: true };
}

export async function deleteEvent(id: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');
  if (!id) throw new Error('Missing event id');

  const supabase = createSupabaseClient();
  if (!supabase) throw new Error('Supabase credentials are not configured.');

  const firstDelete = await supabase.from('events').delete().eq('id', id);
  if (!firstDelete.error) return { success: true };

  const isConstraintError = firstDelete.error.code === '23503' || 
    firstDelete.error.message?.toLowerCase().includes('foreign key') ||
    firstDelete.error.message?.toLowerCase().includes('event_coordinators');
  
  if (!isConstraintError) throw new Error(firstDelete.error.message);

  const { error: coordError } = await supabase.from('event_coordinators').delete().eq('event_id', id);
  if (coordError) throw new Error(`Failed to remove coordinators: ${coordError.message}`);

  const retryDelete = await supabase.from('events').delete().eq('id', id);
  if (retryDelete.error) throw new Error(`Coordinators removed, but deleting event failed: ${retryDelete.error.message}`);

  return { success: true };
}
