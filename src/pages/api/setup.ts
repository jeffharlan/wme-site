export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import { adminUsers } from '../../lib/schema';
import { hashPassword, getUserCount } from '../../lib/auth';

export const POST: APIRoute = async ({ request, redirect }) => {
  // Only allow setup when no users exist
  const userCount = await getUserCount();
  if (userCount > 0) {
    return new Response('Setup already completed', { status: 403 });
  }

  const formData = await request.formData();
  const username = formData.get('username')?.toString()?.trim();
  const password = formData.get('password')?.toString();
  const passwordConfirm = formData.get('password_confirm')?.toString();

  if (!username || !password || !passwordConfirm) {
    return redirect('/admin/setup?error=missing');
  }

  if (password.length < 8) {
    return redirect('/admin/setup?error=short');
  }

  if (password !== passwordConfirm) {
    return redirect('/admin/setup?error=mismatch');
  }

  const id = crypto.randomUUID();
  const passwordHash = hashPassword(password);

  await db.insert(adminUsers).values({
    id,
    username,
    passwordHash,
  });

  return redirect('/admin/setup?success=1');
};
