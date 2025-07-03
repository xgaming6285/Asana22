import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Verification token is missing' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 });
    }

    if (new Date() > new Date(user.emailVerificationTokenExpires)) {
      // Here you could add logic to resend the token
      return NextResponse.json({ error: 'Verification token has expired' }, { status: 400 });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
    });

    // Redirect to a success page or login page
    const successUrl = new URL('/login?verified=true', process.env.NEXT_PUBLIC_APP_URL);
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Email verification error:', error);
    const errorUrl = new URL('/login?error=verification_failed', process.env.NEXT_PUBLIC_APP_URL);
    return NextResponse.redirect(errorUrl);
  }
} 