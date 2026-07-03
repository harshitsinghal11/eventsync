'use client';

import { createOpportunity } from '@/src/actions/opportunityActions';
import OpportunityForm, { OpportunityFormState } from './OpportunityForm';

export default function CreateOpportunityPanel() {
  async function handleSubmit(data: OpportunityFormState) {
    const result = await createOpportunity({
      ...data,
      registration_link: data.registration_link.trim() || null,
    });

    return result as { success: boolean; error?: string };
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <OpportunityForm
        onSubmit={handleSubmit}
        submitLabel="Create Opportunity"
        loadingLabel="Creating opportunity..."
        successMessage="Opportunity created and published."
      />
    </div>
  );
}
