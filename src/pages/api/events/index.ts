export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { events } from '../../../lib/schema';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const title = formData.get('title')?.toString()?.trim();
  const description = formData.get('description')?.toString()?.trim() || null;
  const eventDate = formData.get('event_date')?.toString()?.trim() || null;
  const location = formData.get('location')?.toString()?.trim() || null;

  if (!title) {
    return redirect('/admin/events/new?error=missing');
  }

  const id = crypto.randomUUID();
  const slug = slugify(title) + '-' + id.slice(0, 6);

  await db.insert(events).values({
    id,
    title,
    slug,
    description,
    eventDate,
    location,
  });

  return redirect(`/admin/events/${id}`);
};
