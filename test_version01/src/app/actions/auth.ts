'use server';

import { cookies } from 'next/headers';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  tier?: 'Free' | 'Pro';
}

/**
 * Sets the secure HttpOnly cookie for the authenticated user session.
 */
export async function loginUser(userData: UserSession) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const cookieStore = await cookies();
  cookieStore.set('session', JSON.stringify(userData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Deletes the session cookie on logout.
 */
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
