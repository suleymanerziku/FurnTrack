
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

  // Public auth routes bypass i18n and auth checks
  if (pathname.startsWith('/auth')) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient<Database>({ req, res });
    await supabase.auth.getSession(); // Refresh session, but don't block
    return res;
  }
  
  // All other routes go through i18n and then auth check.
  const res = i18nMiddleware(req);

  // If i18n middleware decided to redirect (e.g., to add a missing locale),
  // we should just follow that redirect and not process further.
  if (res.status === 307 || res.status === 308) {
      return res;
  }

  // --- Start Authentication Check ---
  const supabase = createMiddlewareClient<Database>({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL('/auth/login', req.url);
    // After i18n, pathname might be prefixed, e.g., /en/dashboard
    // We save this full path to redirect back to it after login.
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }
  // --- End Authentication Check ---

  // --- Start Authorization (RBAC) Logic ---

  // 1. Get the user's role from your `users` table.
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();
  
  if (profileError || !userProfile) {
    console.error(`RBAC Error: Could not fetch profile for user ${session.user.id}.`, profileError);
    // Redirect to login and clear session if profile is missing
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('error', 'Your user profile could not be loaded. Please log in again.');
    const response = NextResponse.redirect(loginUrl);
    await createMiddlewareClient<Database>({ req, res: response }).auth.signOut();
    return response;
  }

  const userRoleName = userProfile.role || 'Staff'; // Default to a restricted role

  // 2. Admins and Managers have access to everything.
  if (['admin', 'manager'].includes(userRoleName.toLowerCase())) {
    return res;
  }

  // 3. Define page access permissions for other roles
  const rolePermissions: Record<string, string[]> = {
    'Finance': ['/finances'],
    'Coordinator': ['/work-log'],
    // Staff has no extra permissions beyond the base ones.
  };

  // Base permissions for ALL authenticated users
  const basePermissions = [
    '/', // Dashboard access for all
    '/settings/profile',
    '/settings/general',
  ];

  // 4. Determine the user's full set of permissions
  const userRolePermissions = rolePermissions[userRoleName] || [];
  const allAllowedPaths = [...new Set([...basePermissions, ...userRolePermissions])];

  // Grant access to the /settings hub page ONLY if the user has permission to access one of its children.
  if (allAllowedPaths.some(p => p.startsWith('/settings/'))) {
    allAllowedPaths.push('/settings');
  }
  
  // 5. Check if the user has permission to access the requested path
  
  // Extract the clean path without locale prefix
  const pathSegments = pathname.split('/');
  const potentialLocale = pathSegments[1];
  const currentLocale = locales.includes(potentialLocale as any) ? potentialLocale : defaultLocale;
  let reqPath = pathname;
  if (locales.includes(potentialLocale as any)) {
      reqPath = pathname.replace(`/${currentLocale}`, '') || '/';
  }

  const hasPermission = allAllowedPaths.some(p => {
    // Exact match: e.g. reqPath '/settings/profile' matches permission '/settings/profile'
    if (reqPath === p) return true;
    
    // Dynamic sub-path match: e.g. reqPath '/settings/employees/123' matches permission '/settings/employees'
    if (p !== '/' && reqPath.startsWith(p + '/')) return true;
    
    return false;
  });
  
  // 6. Redirect if the user does not have permission
  if (!hasPermission) {
      const dashboardUrl = new URL(`/${currentLocale}`, req.url);
      return NextResponse.redirect(dashboardUrl);
  }

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
