import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Cloudflare Pages requires the edge runtime
export const runtime = 'edge';

export async function middleware(request: NextRequest) {
  // Create an unmodified response by default
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Initialize the Supabase Edge-compatible client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This safely and accurately checks the secure Supabase cookies
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. Let static files, API routes, and Auth Callback routes pass through untouched
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/auth') ||
    path.includes('.')
  ) {
    return response;
  }

  // 2. If the user IS logged in and tries to visit the login page, push them to the dashboard
  if (user && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. If the user is NOT logged in and tries to access the dashboard, kick them back to login
  if (!user && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Note: Guest users can still access '/' (the home page) safely.
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
