export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { events } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const { id } = params;
  if (!id) return new Response('Missing ID', { status: 400 });

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'delete') {
    await db.delete(events).where(eq(events.id, id));
    return redirect('/admin/events');
  }

  // Update
  const formData = await request.formData();
  const title = formData.get('title')?.toString()?.trim();
  const description = formData.get('description')?.toString()?.trim() || null;
  const eventDate = formData.get('event_date')?.toString()?.trim() || null;
  const location = formData.get('location')?.toString()?.trim() || null;
  const isActive = formData.get('is_active') === 'on';

  if (!title) return redirect(`/admin/events/${id}?msg=error`);

  await db.update(events).set({
    title,
    description,
    eventDate,
    location,
    isActive,
    updatedAt: new Date().toISOString(),
  }).where(eq(events.id, id));

  return redirect(`/admin/events/${id}?msg=saved`);
};
