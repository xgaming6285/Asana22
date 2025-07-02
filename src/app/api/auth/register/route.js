import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { encryptUserData } from '../../../utils/encryption';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

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