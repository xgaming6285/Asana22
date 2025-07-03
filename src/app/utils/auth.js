import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUserIdFromToken() {
  const cookieStore = await cookies();
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

export async function getUserFromToken() {
  const userId = await getUserIdFromToken();
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      systemRole: true,
    },
  });

  return user;
}

export async function isSuperAdmin(userId = null) {
  try {
    const targetUserId = userId || await getUserIdFromToken();
    
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        systemRole: true,
      },
    });

    return user?.systemRole === 'SUPER_ADMIN';
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

export async function requireSuperAdmin() {
  const userId = await getUserIdFromToken();
  const isAdmin = await isSuperAdmin(userId);
  
  if (!isAdmin) {
    throw new Error('Super admin access required');
  }
  
  return userId;
} 