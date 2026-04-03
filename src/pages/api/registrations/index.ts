export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { registrations, formFields, events } from '../../../lib/schema';
import { eq, asc } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const eventId = formData.get('event_id')?.toString();

  if (!eventId) return new Response('Missing event_id', { status: 400 });

  // Get event and its fields
  const event = (await db.select().from(events).where(eq(events.id, eventId)).limit(1))[0];
  if (!event || !event.isActive) return new Response('Event not found or inactive', { status: 404 });

  const fields = await db.select().from(formFields).where(eq(formFields.eventId, eventId)).orderBy(asc(formFields.sortOrder));

  // Collect and validate field data
  const data: Record<string, string> = {};
  let email: string | null = null;

  for (const field of fields) {
    const value = formData.get(`field_${field.id}`)?.toString()?.trim() || '';

    if (field.isRequired && !value) {
      return redirect(`/events/${event.slug}?error=missing`);
    }

    data[field.id] = value;

    // Capture email for denormalized column
    if (field.fieldType === 'email' && value) {
      email = value;
    }
  }

  await db.insert(registrations).values({
    id: crypto.randomUUID(),
    eventId,
    data: JSON.stringify(data),
    email,
  });

  return redirect(`/events/${event.slug}?success=1`);
};
