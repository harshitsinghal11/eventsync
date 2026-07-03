'use server';

import { getAdminSession } from '@/src/lib/server/auth';
import { createSupabaseClient } from '@/src/lib/server/supabase';
import {
  getOptionalTrimmedString,
  getRequiredFieldsError,
  getTrimmedString,
} from '@/src/lib/server/validation';

type OpportunityPayload = {
  title?: unknown;
  description?: unknown;
  organization?: unknown;
  deadline?: unknown;
  contact_info?: unknown;
  type?: unknown;
  eligibility?: unknown;
  registration_link?: unknown;
};

export async function createOpportunity(payload: OpportunityPayload) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const title = getTrimmedString(payload.title);
  const contactInfo = getTrimmedString(payload.contact_info);
  const requiredFieldsError = getRequiredFieldsError({ title, 'contact info': contactInfo });
  if (requiredFieldsError) throw new Error(requiredFieldsError);

  const supabase = createSupabaseClient();
  if (!supabase) throw new Error('Supabase credentials are not configured.');

  const { data, error } = await supabase
    .from('opportunities')
    .insert([{
      title,
      description: getOptionalTrimmedString(payload.description),
      organization: getOptionalTrimmedString(payload.organization),
      deadline: getOptionalTrimmedString(payload.deadline),
      type: getOptionalTrimmedString(payload.type),
      contact_info: contactInfo,
      eligibility: getOptionalTrimmedString(payload.eligibility),
      registration_link: getOptionalTrimmedString(payload.registration_link),
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, opportunity: data };
}

export async function updateOpportunity(id: string, payload: OpportunityPayload) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');
  if (!id) throw new Error('Missing opportunity id');

  const title = getTrimmedString(payload.title);
  const contactInfo = getTrimmedString(payload.contact_info);
  const requiredFieldsError = getRequiredFieldsError({ title, 'contact info': contactInfo });
  if (requiredFieldsError) throw new Error(requiredFieldsError);

  const supabase = createSupabaseClient();
  if (!supabase) throw new Error('Supabase credentials are not configured.');

  const { error } = await supabase
    .from('opportunities')
    .update({
      title,
      description: getOptionalTrimmedString(payload.description),
      organization: getOptionalTrimmedString(payload.organization),
      deadline: getOptionalTrimmedString(payload.deadline),
      contact_info: contactInfo,
      type: getOptionalTrimmedString(payload.type),
      eligibility: getOptionalTrimmedString(payload.eligibility),
      registration_link: getOptionalTrimmedString(payload.registration_link),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function deleteOpportunity(id: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');
  if (!id) throw new Error('Missing opportunity id');

  const supabase = createSupabaseClient();
  if (!supabase) throw new Error('Supabase credentials are not configured.');

  const { error } = await supabase.from('opportunities').delete().eq('id', id);
  if (error) throw new Error(error.message);

  return { success: true };
}
