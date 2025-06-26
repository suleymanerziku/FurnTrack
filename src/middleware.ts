
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

  // If i18n middleware decided to redirect (e.g., to add a missing locale),
  // we should just follow that redirect and not process further.
  if (res.status === 307 || res.status === 308) {
      return res;
  }


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

  // --- START: NEW DYNAMIC RBAC Logic ---
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const userRoleName = userProfile?.role || 'Staff'; 

  // Admins always have access. This is a failsafe.
  if (userRoleName.toLowerCase() === 'admin') {
    return res;
  }
  
  // Manually extract locale and path for permission checking
  const pathSegments = pathname.split('/');
  const potentialLocale = pathSegments[1];
  const currentLocale = locales.includes(potentialLocale as any) ? potentialLocale : defaultLocale;
  
  let reqPath = pathname;
  if (locales.includes(potentialLocale as any)) {
      reqPath = pathname.replace(`/${currentLocale}`, '') || '/';
  }

  // Fetch permissions for the user's role from the database
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('permissions')
    .eq('name', userRoleName)
    .single();

  if(roleError) {
    console.error(`RBAC Error: Could not fetch permissions for role: ${userRoleName}`, roleError);
    // Fail safe: redirect to dashboard if permissions can't be fetched
    const dashboardUrl = new URL(`/${currentLocale}`, req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  const userPermissions = roleData?.permissions || [];
  
  // Base permissions for all authenticated users that cannot be configured
  const basePermissions = [
    '/', // Grant access to the main dashboard for all roles
    '/settings', // The settings hub page itself
    '/settings/profile',
    '/settings/general',
  ];

  // Check if requested path is either a base permission or in the dynamic list
  const hasUserPermission = userPermissions.some(p => {
    // Exact match (e.g., '/finances')
    if (p === reqPath) return true;
    // Dynamic route match (e.g., p='/settings/employees', reqPath='/settings/employees/123')
    if (reqPath.startsWith(p + '/')) return true; 
    return false;
  });
  
  const hasPermission = 
    basePermissions.includes(reqPath) || 
    hasUserPermission;
  
  if (!hasPermission) {
      const dashboardUrl = new URL(`/${currentLocale}`, req.url);
      return NextResponse.redirect(dashboardUrl);
  }
  // --- END: NEW DYNAMIC RBAC Logic ---

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
