'use server';

import { getSession } from '@/src/lib/server/auth';
import { createSupabaseClient } from '@/src/lib/server/supabase';

export async function checkRegistrationStatus(eventId: string) {
  const session = await getSession();
  if (!session) return { isRegistered: false, isAuthenticated: false };

  const supabase = createSupabaseClient();
  if (!supabase) return { isRegistered: false, isAuthenticated: true };

  const { data } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', session.id)
    .maybeSingle();

  return { isRegistered: !!data, isAuthenticated: true };
}

export async function registerForEvent(eventId: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Authentication required' };
  }

  const supabase = createSupabaseClient();
  if (!supabase) return { error: 'Database error' };

  // Check if already registered
  const { data: existing, error: existingError } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', session.id)
    .maybeSingle();

  if (existingError) {
    return { error: 'Failed to verify existing registration' };
  }
  if (existing) {
    return { error: 'You are already registered for this event.' };
  }

  const { error } = await supabase
    .from('event_registrations')
    .insert([{ event_id: eventId, user_id: session.id, status: 'registered' }]);

  if (error) {
    console.error('Registration error:', error);
    return { error: 'Failed to register for the event' };
  }

  return { success: true };
}
