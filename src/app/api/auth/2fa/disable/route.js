import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '../../../../utils/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const userId = await getUserIdFromToken();
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Паролата е задължителна' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: 'Потребителят не е намерен' }, { status: 404 });
    }

    // Verify user's password before disabling
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Невалидна парола' }, { status: 401 });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null, // Clear the secret
      },
    });

    return NextResponse.json({ success: true, message: '2FA е деактивиран успешно' });

  } catch (error) {
    console.error('2FA disable error:', error);
    if (error.message === 'Not authenticated' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Неоторизиран достъп' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Възникна грешка при деактивиране на 2FA' }, { status: 500 });
  }
} 