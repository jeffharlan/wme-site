export const prerender = false;

import type { APIRoute } from 'astro';
import { destroySession } from '../../../lib/auth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const token = cookies.get('wme_session')?.value;
  if (token) {
    await destroySession(token);
  }

  cookies.delete('wme_session', { path: '/' });
  return redirect('/admin/login');
};
