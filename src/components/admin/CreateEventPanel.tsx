'use client';

import { createEvent } from '@/src/actions/eventActions';
import EventForm, { EventFormState } from './EventForm';

export default function CreateEventPanel() {
  async function handleSubmit(data: EventFormState) {
    const result = await createEvent({
      ...data,
      perks: data.perks
        ? data.perks.split(',').map((value) => value.trim()).filter(Boolean)
        : [],
      registration_link: data.registration_link.trim() || null,
      coordinators: data.coordinators
        .filter((coordinator) => coordinator.name.trim())
        .map(({ name, phone }) => ({ name, phone })),
    });

    return result as { success: boolean; warning?: string };
  }

  return (
    <EventForm
      onSubmit={handleSubmit}
      submitLabel="Create Event"
      loadingLabel="Creating event..."
      successMessage="Event created successfully."
    />
  );
}
