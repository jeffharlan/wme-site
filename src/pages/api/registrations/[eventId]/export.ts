export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '../../../../lib/db';
import { events, formFields, registrations } from '../../../../lib/schema';
import { eq, asc, desc } from 'drizzle-orm';

export const GET: APIRoute = async ({ params }) => {
  const { eventId } = params;
  if (!eventId) return new Response('Missing event ID', { status: 400 });

  const event = (await db.select().from(events).where(eq(events.id, eventId)).limit(1))[0];
  if (!event) return new Response('Event not found', { status: 404 });

  const fields = await db.select().from(formFields).where(eq(formFields.eventId, eventId)).orderBy(asc(formFields.sortOrder));
  const regs = await db.select().from(registrations).where(eq(registrations.eventId, eventId)).orderBy(desc(registrations.createdAt));

  // Build CSV
  const headers = fields.map(f => f.label).concat(['Registered At']);
  const rows = regs.map(reg => {
    const data = JSON.parse(reg.data);
    return fields.map(f => {
      const val = (data[f.id] || '').replace(/"/g, '""');
      return `"${val}"`;
    }).concat([`"${reg.createdAt}"`]);
  });

  const csv = [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${event.slug}-registrations.csv"`,
    },
  });
};
