export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { formFields } from '../../../lib/schema';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const eventId = formData.get('event_id')?.toString();
  const label = formData.get('label')?.toString()?.trim();
  const fieldType = formData.get('field_type')?.toString() || 'text';
  const options = formData.get('options')?.toString()?.trim() || null;
  const isRequired = formData.get('is_required') === 'on';
  const sortOrder = parseInt(formData.get('sort_order')?.toString() || '0');

  if (!eventId || !label) {
    return redirect(`/admin/events/${eventId}?msg=error`);
  }

  await db.insert(formFields).values({
    id: crypto.randomUUID(),
    eventId,
    label,
    fieldType,
    options: options ? JSON.stringify(options.split(',').map(o => o.trim())) : null,
    isRequired,
    sortOrder,
  });

  return redirect(`/admin/events/${eventId}?msg=field_added`);
};
