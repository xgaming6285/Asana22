import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  // Clear the token cookie with the same options it was set with
  const cookieStore = await cookies();
  cookieStore.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0), // Set expiry date to the past
  });

  return NextResponse.json({ message: 'Logout successful' });
} 