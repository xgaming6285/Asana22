import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { encryptUserData } from '../../../utils/encryption';
import { validatePassword, validateEmail, sanitizeString } from '../../../utils/validation';
import crypto from 'crypto';
import { Resend } from 'resend';
import EmailVerificationEmail from '@/app/components/emails/EmailVerificationEmail';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    let { email, password, firstName, lastName } = body;

    // Sanitize inputs
    email = sanitizeString(email);
    firstName = sanitizeString(firstName);
    lastName = sanitizeString(lastName);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Password does not meet security requirements: ' + passwordErrors.join(', ')
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
        // If user exists but is not verified, we can resend the verification email
        if (!existingUser.emailVerified) {
            // Potentially add logic here to resend verification email if needed
            return NextResponse.json({ error: 'This email is already registered but not verified. Please check your email for a verification link.' }, { status: 409 });
        }
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Encrypt user data before saving
    const encryptedData = encryptUserData({
      email,
      firstName,
      lastName,
    });

    // Create the new user
    await prisma.user.create({
      data: {
        ...encryptedData,
        password: hashedPassword,
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
        console.error('Failed to send verification email:', error);
        // Even if email fails, user is created. They can request another email.
        // For production, you might want a more robust error handling or retry mechanism.
    }

    return NextResponse.json({ message: 'Registration successful. Please check your email to verify your account.' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 