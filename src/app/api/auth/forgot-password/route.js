import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { decryptUserData } from '../../../utils/encryption';
import crypto from 'crypto';
import { Resend } from 'resend';
import PasswordResetEmail from '@/app/components/emails/PasswordResetEmail';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Имейлът е задължителен' }, { status: 400 });
    }

    // Since emails are encrypted, we must fetch all users and decrypt to find a match.
    const allUsers = await prisma.user.findMany();
    let user = null;
    for (const u of allUsers) {
      const decryptedUser = decryptUserData(u);
      if (decryptedUser.email === email) {
        user = u;
        break;
      }
    }

    // To prevent email enumeration, we always return a success-like message.
    // We'll only send an email if we actually found a verified user.
    if (user && user.emailVerified) {
      // Generate a password reset token
      const passwordResetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

      // Hash the token for storage
      const hashedToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex');

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetTokenExpires,
        },
      });

      // Send the password reset email
      if (process.env.RESEND_API_KEY) {
        try {
          const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${passwordResetToken}`;
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Нулиране на парола',
            react: PasswordResetEmail({ resetLink }),
          });
        } catch (error) {
          console.error('Failed to send password reset email:', error);
          // Do not expose the error to the client to prevent information leakage.
          // The generic success message will be sent below.
        }
      } else {
        console.warn('RESEND_API_KEY not configured, skipping password reset email');
      }
    }

    return NextResponse.json({ message: 'Ако съществува акаунт с този имейл, ще бъде изпратен линк за нулиране на паролата.' }, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    // Generic error for the client
    return NextResponse.json({ error: 'Възникна вътрешна грешка в сървъра' }, { status: 500 });
  }
} 