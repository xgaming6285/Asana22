import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decryptUserData } from '../../../utils/encryption';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Имейл и парола са задължителни' }, { status: 400 });
    }

    // Since emails are encrypted, we can't use findUnique.
    // We must fetch all users, decrypt their email, and then find the match.
    const allUsers = await prisma.user.findMany();
    let user = null;

    for (const u of allUsers) {
      const decryptedUser = decryptUserData(u);
      if (decryptedUser.email === email) {
        user = u; // Keep the original user object with encrypted data
        break;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Невалидни данни за вход' }, { status: 401 });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Моля, потвърдете имейла си, преди да влезете. Проверете входящата си поща за линк за верификация.',
          action: 'resend_verification' 
        }, 
        { status: 403 }
      );
    }

    if (!user.password) {
      // We check for user.password to handle users migrated from Clerk without a password yet
      return NextResponse.json({ error: 'Невалидни данни за вход' }, { status: 401 });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Невалидни данни за вход' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Set token in an httpOnly cookie
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    const decryptedUser = decryptUserData(user);
    const { password: _, ...userWithoutPassword } = decryptedUser;

    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Възникна вътрешна грешка в сървъра' }, { status: 500 });
  }
} 