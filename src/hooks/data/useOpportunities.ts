import useSWR from 'swr';
import { supabase } from '@/src/lib/supabase';
import type { Opportunity } from '@/src/types';

export function useOpportunities() {
  const { data, error, isLoading, mutate } = useSWR<Opportunity[]>('opportunities', async () => {
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('deadline', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return opportunities as Opportunity[];
  });

  return {
    opportunities: data ?? [],
    isLoading,
    isError: error,
    mutate
  };
}

export function useOpportunity(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Opportunity | null>(id ? `opportunity-${id}` : null, async () => {
    const { data: opportunity, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return opportunity as Opportunity;
  });

  return {
    opportunity: data,
    isLoading,
    isError: error,
    mutate
  };
}
