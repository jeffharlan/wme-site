export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { formFields } from '../../../lib/schema';
import { eq, and, asc } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const { id } = params;
  if (!id) return new Response('Missing ID', { status: 400 });

  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const eventId = url.searchParams.get('event_id');

  if (action === 'delete') {
    await db.delete(formFields).where(eq(formFields.id, id));
    return redirect(`/admin/events/${eventId}?msg=field_deleted`);
  }

  if (action === 'move_up' || action === 'move_down') {
    if (!eventId) return new Response('Missing event_id', { status: 400 });

    // Get all fields for this event in order
    const allFields = await db.select().from(formFields)
      .where(eq(formFields.eventId, eventId))
      .orderBy(asc(formFields.sortOrder));

    const currentIndex = allFields.findIndex(f => f.id === id);
    if (currentIndex === -1) return new Response('Field not found', { status: 404 });

    const swapIndex = action === 'move_up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= allFields.length) {
      return redirect(`/admin/events/${eventId}`);
    }

    // Swap sort orders
    const currentField = allFields[currentIndex];
    const swapField = allFields[swapIndex];

    await db.update(formFields).set({ sortOrder: swapField.sortOrder }).where(eq(formFields.id, currentField.id));
    await db.update(formFields).set({ sortOrder: currentField.sortOrder }).where(eq(formFields.id, swapField.id));

    return redirect(`/admin/events/${eventId}?msg=reordered`);
  }

  return new Response('Unknown action', { status: 400 });
};
