
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

// --- START PERMISSION DEFINITIONS ---

// Base permissions for ALL authenticated users
const BASE_PERMISSIONS = [
  '/', // Dashboard
  '/settings/profile',
  '/settings/general',
  '/settings', // The settings hub page itself
];

// Permissions specific to certain roles
const ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: [
    '/finances',
    '/work-log',
    '/reports',
    '/settings/users',
    '/settings/roles',
    '/settings/employees',
    '/settings/authorization',
    '/settings/task-types',
  ],
  Manager: [
    '/finances',
    '/work-log',
    '/reports',
    '/settings/users',
    '/settings/roles',
    '/settings/employees',
    '/settings/authorization',
    '/settings/task-types',
  ],
  Finance: [
    '/finances'
  ],
  Coordinator: [
    '/work-log'
  ],
  Staff: [], // Staff have only base permissions
};

// --- END PERMISSION DEFINITIONS ---


export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bypass all checks for static assets and internal Next.js paths.
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.endsWith('.ico') || pathname.endsWith('.png')) {
    return NextResponse.next();
  }

  // Handle auth pages separately: they are public.
  if (pathname.startsWith('/auth')) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient<Database>({ req, res });
    await supabase.auth.getSession(); // Refresh session if one exists, but don't block.
    return res;
  }
  
  // Apply i18n middleware to all other routes.
  const i18nResponse = i18nMiddleware(req);
  // If i18n redirects, follow it immediately.
  if (i18nResponse.status === 307 || i18nResponse.status === 308) {
      return i18nResponse;
  }

  // --- Start Authentication & Authorization ---
  const supabase = createMiddlewareClient<Database>({ req, res: i18nResponse });
  const { data: { session } } = await supabase.auth.getSession();

  // If there's no active session, redirect to login.
  if (!session) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- Authorization (RBAC) Logic ---
  const userRole = session.user.user_metadata?.role || 'Staff';

  // Get all permissions for the user's role.
  // Admins and Managers get all defined role permissions.
  const userPermissions = (userRole === 'Admin' || userRole === 'Manager')
    ? Object.values(ROLE_PERMISSIONS).flat()
    : (ROLE_PERMISSIONS[userRole] || []);
  
  const allowedPaths = [...new Set([...BASE_PERMISSIONS, ...userPermissions])];

  // Extract the clean path without locale prefix
  const pathSegments = pathname.split('/');
  const potentialLocale = pathSegments[1];
  const currentLocale = locales.includes(potentialLocale as any) ? potentialLocale : defaultLocale;
  let reqPath = pathname;
  if (locales.includes(potentialLocale as any)) {
      reqPath = pathname.replace(`/${currentLocale}`, '') || '/';
  }

  // Check if user has permission. This handles exact matches and sub-paths.
  const hasPermission = allowedPaths.some(p => reqPath.startsWith(p));
  
  // If user does not have permission, redirect to their default dashboard.
  if (!hasPermission) {
      const dashboardUrl = new URL(`/${currentLocale}`, req.url);
      return NextResponse.redirect(dashboardUrl);
  }

  return i18nResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
