export const prerender = false;

import type { APIRoute } from 'astro';
import { getUserByUsername, verifyPassword, createSession, checkRateLimit } from '../../../lib/auth';
import { verifyTOTP } from '../../../lib/totp';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const username = formData.get('username')?.toString()?.trim();
  const password = formData.get('password')?.toString();
  const totpCode = formData.get('totp_code')?.toString()?.trim();

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return redirect('/admin/login?error=rate_limit');
  }

  if (!username || !password) {
    return redirect('/admin/login?error=invalid');
  }

  const user = await getUserByUsername(username);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return redirect('/admin/login?error=invalid');
  }

  // Check TOTP if enabled
  if (user.totpEnabled && user.totpSecret) {
    if (!totpCode) {
      return redirect('/admin/login?error=totp_required');
    }
    if (!verifyTOTP(user.totpSecret, totpCode)) {
      return redirect('/admin/login?error=totp_invalid');
    }
  }

  // Create session
  const token = await createSession(user.id);

  cookies.set('wme_session', token, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return redirect('/admin');
};
