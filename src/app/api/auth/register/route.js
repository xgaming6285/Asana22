import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { encryptUserData } from '../../../utils/encryption';
import { validatePassword, validateEmail, sanitizeString } from '../../../utils/validation';

const prisma = new PrismaClient();

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
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for better security

    // Encrypt user data before saving
    const encryptedData = encryptUserData({
      email,
      firstName,
      lastName,
    });

    // Create the new user
    const user = await prisma.user.create({
      data: {
        ...encryptedData,
        password: hashedPassword,
      },
    });

    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 