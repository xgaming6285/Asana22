import { PrismaClient } from '@prisma/client';
import { authenticator } from 'otplib';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { decryptUserData } from '../../../../utils/encryption';

const prisma = new PrismaClient();

// This is a new route for the second step of the login process
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, token: twoFactorToken } = body;

    if (!email || !twoFactorToken) {
      return NextResponse.json({ error: 'Имейл и 2FA код са задължителни' }, { status: 400 });
    }

    // Find the user by email (decryption needed)
    const allUsers = await prisma.user.findMany();
    let user = null;
    let decryptedUserForEmail;

    for (const u of allUsers) {
      const decryptedUser = decryptUserData(u);
      if (decryptedUser.email === email) {
        user = u; // Keep the original user object
        decryptedUserForEmail = decryptedUser; // Keep decrypted for token
        break;
      }
    }

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: 'Невалидни данни или 2FA не е активиран' }, { status: 401 });
    }
    
    // Verify the 2FA token
    const isValid = authenticator.check(twoFactorToken, user.twoFactorSecret);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Невалиден 2FA код' }, { status: 400 });
    }

    // If valid, create the final JWT and session
    const finalToken = jwt.sign(
      { userId: user.id, email: decryptedUserForEmail.email }, // Use decrypted email for consistency
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const { password: _, ...userWithoutPassword } = decryptedUserForEmail;

    const res = NextResponse.json({ user: userWithoutPassword });
    res.cookies.set('token', finalToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return res;

  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json({ error: 'Възникна вътрешна грешка в сървъра' }, { status: 500 });
  }
} 