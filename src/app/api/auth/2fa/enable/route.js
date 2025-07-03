import { PrismaClient } from '@prisma/client';
import { authenticator } from 'otplib';
import { getUserIdFromToken } from '../../../../utils/auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const userId = await getUserIdFromToken();
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Липсва 2FA код' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA не е настроен за този потребител' }, { status: 400 });
    }

    // Verify the token
    const isValid = authenticator.check(token, user.twoFactorSecret, {
        window: 1
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Невалиден 2FA код' }, { status: 400 });
    }

    // Enable 2FA for the user
    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });

    return NextResponse.json({ success: true, message: '2FA е активиран успешно' });

  } catch (error) {
    console.error('2FA enable error:', error);
    if (error.message === 'Not authenticated' || error.message === 'Invalid token') {
        return NextResponse.json({ error: 'Неоторизиран достъп' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Възникна грешка при активиране на 2FA' }, { status: 500 });
  }
} 