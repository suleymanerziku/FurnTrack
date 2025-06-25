
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';
import { createI18nMiddleware } from 'next-international/middleware';
import { locales, defaultLocale } from '@/locales/i18n';

const i18nMiddleware = createI18nMiddleware({
  locales,
  defaultLocale,
});

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth routes are handled first and bypass i18n logic that prefixes paths.
  if (pathname.startsWith('/auth')) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient<Database>({ req, res });
    await supabase.auth.getSession(); // Refresh session
    return res;
  }
  
  // All other non-public routes go through i18n and then auth check.
  const res = i18nMiddleware(req);

  // The i18n middleware might have rewritten the URL.
  // We need a session to access these pages.
  const supabase = createMiddlewareClient<Database>({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL('/auth/login', req.url);
    // After i18n, pathname might be prefixed, e.g., /am/dashboard
    // We save this full path to redirect back to it after login.
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- START: RBAC Logic ---
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const userRole = userProfile?.role || 'Staff'; 

  // Admins and Managers have full access.
  if (['Admin', 'Manager'].includes(userRole)) {
    return res;
  }
  
  // Get the path without the locale prefix.
  const reqPath = pathname.replace(new RegExp(`^/${req.nextUrl.locale}`), '') || '/';

  const isAllowed = (role: string, path: string): boolean => {
      // Paths accessible to almost all authenticated users
      const commonPaths = ['/', '/settings/profile', '/settings/general'];
      if(path === '/settings' || commonPaths.some(p => path.startsWith(p))) {
          return true;
      }

      // Role-specific paths
      switch(role) {
          case 'Finance':
              return path.startsWith('/finances');
          case 'Coordinator':
              return path.startsWith('/work-log');
          default:
              return false; // Deny other paths for other roles by default
      }
  }

  if (!isAllowed(userRole, reqPath)) {
      // Redirect to user's dashboard if not authorized
      const dashboardUrl = new URL(`/${req.nextUrl.locale}`, req.url);
      return NextResponse.redirect(dashboardUrl);
  }
  // --- END: RBAC Logic ---

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images folder if you have one)
     * - public/ (if you serve other static assets from public directly)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};
