export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { registrations } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const { eventId } = params;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const regId = url.searchParams.get('reg_id');

  if (action === 'delete' && regId) {
    await db.delete(registrations).where(eq(registrations.id, regId));
    return redirect(`/admin/events/${eventId}/registrations`);
  }

  return new Response('Unknown action', { status: 400 });
};
