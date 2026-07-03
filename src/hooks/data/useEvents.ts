import useSWR from 'swr';
import { supabase } from '@/src/lib/supabase';
import type { Event } from '@/src/types';

export function useEvents() {
  const { data, error, isLoading, mutate } = useSWR<Event[]>('events', async () => {
    const { data: events, error } = await supabase
      .from('events')
      .select('*, event_coordinators(*)')
      .order('date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return events as Event[];
  });

  return {
    events: data ?? [],
    isLoading,
    isError: error,
    mutate
  };
}

export function useEvent(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Event | null>(id ? `event-${id}` : null, async () => {
    const { data: event, error } = await supabase
      .from('events')
      .select('*, event_coordinators(*)')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return event as Event;
  });

  return {
    event: data,
    isLoading,
    isError: error,
    mutate
  };
}
