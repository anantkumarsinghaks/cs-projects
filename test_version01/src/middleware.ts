import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export const runtime = 'edge';
/**
 * Route protection proxy for Next.js.
 * Manages access control between landing page, login page, and dashboard.
 */
export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  const isLoginPage = path === '/login';
  const isApiRoute = path.startsWith('/api');
  const isStatic = path.includes('.') || path.startsWith('/_next');

  // Let API endpoints and static resources pass through automatically
  if (isStatic || isApiRoute) {
    return NextResponse.next();
  }

  // If there is an active session and the user is visiting the login page,
  // redirect them to the home route (dashboard).
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Note: Guest users are allowed to access `/` (home route), which will
  // dynamically render the landing page instead of the files dashboard.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply proxy to all pages, excluding static files
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
