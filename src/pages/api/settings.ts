export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { settings } from '../../lib/schema';
import { eq } from 'drizzle-orm';
import { encrypt } from '../../lib/encrypt';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();

  const apiKey = formData.get('smtp2go_api_key')?.toString()?.trim();
  const senderEmail = formData.get('smtp2go_sender_email')?.toString()?.trim();
  const senderName = formData.get('smtp2go_sender_name')?.toString()?.trim();

  // Upsert settings
  const upsert = async (key: string, value: string, sensitive = false) => {
    const storedValue = sensitive ? encrypt(value) : value;
    const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (existing.length > 0) {
      await db.update(settings).set({ value: storedValue, updatedAt: new Date().toISOString() }).where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value: storedValue });
    }
  };

  // Only update API key if a new one was provided
  if (apiKey) {
    await upsert('smtp2go_api_key', apiKey, true);
  }
  if (senderEmail) {
    await upsert('smtp2go_sender_email', senderEmail);
  }
  if (senderName) {
    await upsert('smtp2go_sender_name', senderName);
  }

  return redirect('/admin/settings?msg=smtp_saved');
};
