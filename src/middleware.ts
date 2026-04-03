import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/auth';

const PUBLIC_PATHS = [
  '/admin/login',
  '/admin/setup',
  '/api/auth/login',
  '/api/setup',
];

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const isAdminRoute = path.startsWith('/admin');
  const isApiRoute = path.startsWith('/api/');

  // Only check auth for admin/API routes — public pages skip DB entirely
  if (isAdminRoute || isApiRoute) {
    const isPublicRegistration = path.startsWith('/api/registrations') && context.request.method === 'POST';
    const isPublicPath = PUBLIC_PATHS.some(p => path.startsWith(p));

    let user = null;
    try {
      const sessionToken = context.cookies.get('wme_session')?.value;
      user = sessionToken ? await getSession(sessionToken) : null;
    } catch {
      // DB not available — treat as unauthenticated
    }
    context.locals.user = user;

    if (!isPublicPath && !isPublicRegistration && !user) {
      if (isApiRoute) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return context.redirect('/admin/login');
    }
  } else {
    context.locals.user = null;
  }

  return next();
});
