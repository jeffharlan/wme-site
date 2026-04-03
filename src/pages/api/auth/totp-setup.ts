export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { adminUsers } from '../../../lib/schema';
import { eq } from 'drizzle-orm';
import { generateTOTPSecret, verifyTOTP } from '../../../lib/totp';

export const POST: APIRoute = async ({ locals, request, redirect }) => {
  const user = locals.user;
  if (!user) return redirect('/admin/login');

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  // Disable TOTP
  if (action === 'disable') {
    await db.update(adminUsers).set({
      totpSecret: null,
      totpEnabled: false,
    }).where(eq(adminUsers.id, user.userId));
    return redirect('/admin/settings?msg=totp_disabled');
  }

  // Check if verifying a code
  const formData = await request.formData();
  const code = formData.get('totp_code')?.toString()?.trim();
  const pendingSecret = formData.get('totp_secret')?.toString();

  if (code && pendingSecret) {
    // Verify and enable
    if (verifyTOTP(pendingSecret, code)) {
      await db.update(adminUsers).set({
        totpSecret: pendingSecret,
        totpEnabled: true,
      }).where(eq(adminUsers.id, user.userId));
      return redirect('/admin/settings?msg=totp_enabled');
    }
    return redirect('/admin/settings?msg=totp_invalid');
  }

  // Generate new secret and show QR setup page
  const { secret, uri } = generateTOTPSecret(user.username);

  return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Set Up 2FA — WME Admin</title>
  <link rel="icon" type="image/png" href="/images/wme-logo.png" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; background: #0a0f1a; color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .card { max-width: 420px; width: 100%; background: rgba(15,22,40,0.8); border: 1px solid rgba(255,255,255,0.06); border-radius: 1rem; padding: 2.5rem; text-align: center; }
    h1 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
    .sub { color: rgba(255,255,255,0.4); font-size: 0.8125rem; margin-bottom: 1.5rem; }
    .qr { background: white; padding: 1rem; border-radius: 0.5rem; display: inline-block; margin-bottom: 1rem; }
    .secret { color: #d4a017; font-family: monospace; font-size: 0.8125rem; word-break: break-all; margin-bottom: 1.5rem; padding: 0.75rem; background: rgba(212,160,23,0.08); border-radius: 0.375rem; }
    .label { font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.4); margin-bottom: 0.5rem; text-align: left; }
    .input { width: 100%; padding: 0.75rem 1rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.625rem; color: white; font-size: 1.125rem; text-align: center; letter-spacing: 0.3em; font-family: monospace; margin-bottom: 1.25rem; }
    .input:focus { outline: none; border-color: rgba(212,160,23,0.4); }
    .btn { width: 100%; padding: 0.75rem; font-size: 0.9375rem; font-weight: 600; border: none; border-radius: 0.625rem; cursor: pointer; background: linear-gradient(135deg, #d4a017, #b8860b); color: white; }
    .back { display: inline-block; color: rgba(255,255,255,0.3); font-size: 0.8125rem; text-decoration: none; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Set Up Two-Factor Authentication</h1>
    <p class="sub">Scan this QR code with Google Authenticator, Authy, or any TOTP app.</p>

    <div class="qr">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}" alt="QR Code" width="200" height="200" />
    </div>

    <p style="color: rgba(255,255,255,0.3); font-size: 0.75rem; margin-bottom: 0.5rem;">Or enter this key manually:</p>
    <div class="secret">${secret}</div>

    <form method="POST" action="/api/auth/totp-setup">
      <input type="hidden" name="totp_secret" value="${secret}" />
      <label class="label">Enter the 6-digit code from your app</label>
      <input type="text" name="totp_code" required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" class="input" placeholder="000000" autofocus />
      <button type="submit" class="btn">Verify & Enable 2FA</button>
    </form>

    <a href="/admin/settings" class="back">Cancel</a>
  </div>
</body>
</html>`, {
    headers: { 'Content-Type': 'text/html' },
  });
};
