import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { decryptUserData } from '../../../utils/encryption';
import crypto from 'crypto';
import { Resend } from 'resend';
import EmailVerificationEmail from '@/app/components/emails/EmailVerificationEmail';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by decrypting emails
    const allUsers = await prisma.user.findMany();
    let user = null;
    for (const u of allUsers) {
      const decryptedUser = decryptUserData(u);
      if (decryptedUser.email === email) {
        user = u;
        break;
      }
    }

    if (!user) {
      // Return a generic message to prevent email enumeration
      return NextResponse.json({ message: 'If an account with this email exists, a new verification link has been sent.' }, { status: 200 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'This email is already verified.' }, { status: 400 });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationTokenExpires,
      },
    });

    // Send verification email
    try {
      const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${emailVerificationToken}`;
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Verify your email address',
        react: EmailVerificationEmail({ verificationLink }),
      });
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      return NextResponse.json({ error: 'Failed to send verification email. Please try again later.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'A new verification link has been sent to your email.' }, { status: 200 });

  } catch (error) {
    console.error('Resend verification email error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 