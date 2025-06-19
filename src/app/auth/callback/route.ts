
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/'; // Default redirect after callback

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
        console.error("Error exchanging code for session:", error);
        // Redirect to an error page or login with error message
        const errorUrl = new URL('/auth/login', request.url);
        errorUrl.searchParams.set('error', 'Failed to process authentication callback. Please try again.');
        return NextResponse.redirect(errorUrl);
    }
  }

  // URL to redirect to after sign in process completes
  const redirectUrl = new URL(next, request.url); // Ensure 'next' is relative to request.url base
  
  // If next is an absolute URL (e.g. from password reset email), use it directly
  if (next.startsWith('http')) {
    return NextResponse.redirect(next);
  }
  
  return NextResponse.redirect(redirectUrl);
}
