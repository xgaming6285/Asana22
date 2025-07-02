import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function getUserIdFromToken() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.userId) {
        throw new Error('Invalid token payload');
    }

    return payload.userId;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
} 