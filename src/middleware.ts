import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/auth';

const PUBLIC_PATHS = [
  '/admin/login',
  '/admin/setup',
  '/api/auth/login',
  '/api/setup',
];

export const onRequest = defineMiddleware(async (context, next) => {
  const sessionToken = context.cookies.get('wme_session')?.value;
  const user = sessionToken ? await getSession(sessionToken) : null;
  context.locals.user = user;

  const path = context.url.pathname;
  const isAdminRoute = path.startsWith('/admin');
  const isApiRoute = path.startsWith('/api/');
  const isPublicRegistration = path.startsWith('/api/registrations') && context.request.method === 'POST';
  const isPublicPath = PUBLIC_PATHS.some(p => path.startsWith(p));

  // Protect admin and API routes
  if ((isAdminRoute || isApiRoute) && !isPublicPath && !isPublicRegistration && !user) {
    if (isApiRoute) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin/login');
  }

  return next();
});
