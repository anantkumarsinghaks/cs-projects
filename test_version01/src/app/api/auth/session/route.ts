import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false, error: 'No active session' },
        { status: 401 }
      );
    }

    const userData = JSON.parse(sessionCookie);
    return NextResponse.json({ authenticated: true, user: userData });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: 'Invalid session structure' },
      { status: 400 }
    );
  }
}
