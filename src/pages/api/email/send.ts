export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { registrations } from '../../../lib/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '../../../lib/email';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const eventId = formData.get('event_id')?.toString();
  const subject = formData.get('subject')?.toString()?.trim();
  const htmlBody = formData.get('html_body')?.toString();

  if (!eventId || !subject || !htmlBody) {
    return redirect('/admin/email?msg=error');
  }

  // Get all registrant emails for this event
  const regs = await db.select().from(registrations).where(eq(registrations.eventId, eventId));
  const emails = regs.map(r => r.email).filter(Boolean) as string[];

  if (emails.length === 0) {
    return redirect('/admin/email?msg=error');
  }

  const result = await sendEmail({
    to: emails,
    subject,
    htmlBody,
  });

  if (!result.success) {
    if (result.error?.includes('not configured')) {
      return redirect('/admin/email?msg=no_config');
    }
    return redirect('/admin/email?msg=error');
  }

  return redirect(`/admin/email?msg=sent&sent=${emails.length}`);
};
