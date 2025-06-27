
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

  // Manually extract locale and path for permission checking
  const pathSegments = pathname.split('/');
  const potentialLocale = pathSegments[1];
  const currentLocale = locales.includes(potentialLocale as any) ? potentialLocale : defaultLocale;
  
  let reqPath = pathname;
  if (locales.includes(potentialLocale as any)) {
      reqPath = pathname.replace(`/${currentLocale}`, '') || '/';
  }

  // --- START: REFINED DYNAMIC RBAC Logic ---
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const userRoleName = userProfile?.role || 'Staff'; 

  // Admins and Managers have access to everything. This is a failsafe.
  if (userRoleName.toLowerCase() === 'admin' || userRoleName.toLowerCase() === 'manager') {
    return res;
  }
  
  // Fetch permissions for the user's role from the database
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('permissions')
    .ilike('name', userRoleName)
    .single();

  if(roleError && roleError.code !== 'PGRST116') {
    console.error(`RBAC Error: Could not fetch permissions for role: ${userRoleName}`, roleError);
    const dashboardUrl = new URL(`/${currentLocale}`, req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Safely cast the permissions from Json to a string array
  const userPermissions = (roleData?.permissions as string[]) || [];
  
  // Base permissions for all authenticated users that cannot be configured
  const basePermissions = [
    '/settings/profile',
    '/settings/general',
  ];

  // Combine base and dynamic permissions. Use a Set to handle potential duplicates.
  let allAllowedPaths = [...new Set(['/', ...basePermissions, ...userPermissions])];

  // Grant access to the /settings hub page ONLY if the user has permission to access one of its children.
  // This is crucial to prevent redirect loops where a user is sent to /settings but has no visible links.
  if (allAllowedPaths.some(p => p.startsWith('/settings/'))) {
    allAllowedPaths.push('/settings');
  }

  // A user has permission if the requested path is an EXACT match to an allowed path,
  // OR if the requested path is a dynamic sub-path of an allowed path (e.g., /employees/[id]).
  const hasPermission = allAllowedPaths.some(p => {
    // Exact match: e.g. reqPath '/settings/profile' matches permission '/settings/profile'
    if (reqPath === p) return true;
    
    // Dynamic sub-path match: e.g. reqPath '/settings/employees/123' matches permission '/settings/employees'
    // We avoid a root path check (p !== '/') because it's not a parent of other routes in that way.
    if (p !== '/' && reqPath.startsWith(p + '/')) return true;
    
    return false;
  });
  
  if (!hasPermission) {
      const dashboardUrl = new URL(`/${currentLocale}`, req.url);
      return NextResponse.redirect(dashboardUrl);
  }
  // --- END: REFINED DYNAMIC RBAC Logic ---

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
