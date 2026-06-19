export const runtime = 'edge';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (code && supabaseUrl && supabaseAnonKey) {
    console.log("Supabase URL:", supabaseUrl);
    console.log("Anon key exists:", !!supabaseAnonKey);
    console.log("Authorization code:", code);
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("Exchange error:", error);
    console.log("Session:", data.session);
    if (!error && data.session) {
      const user = data.session.user;
      const sessionData = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || '',
        tier: 'Free',
      };

      const cookieStore = await cookies();
      cookieStore.set('session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(data.session.expires_at! * 1000),
        sameSite: 'lax',
        path: '/',
      });
    }
  }

  // Redirect back to the dashboard home
  return NextResponse.redirect(new URL('/', request.url));
}
