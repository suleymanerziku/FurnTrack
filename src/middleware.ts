
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Allow access to auth routes and API routes (including auth callback)
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
    return res;
  }

  // If no session and not an auth route, redirect to login
  if (!session) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirectedFrom', pathname); // Optional: retain original path
    return NextResponse.redirect(loginUrl);
  }

  // If session exists, allow access
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images folder if you have one)
     * - public/ (if you serve other static assets from public directly)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};
