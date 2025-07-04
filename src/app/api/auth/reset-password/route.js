import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { validatePassword } from '../../../utils/validation';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token || !password || !confirmPassword) {
      return NextResponse.json({ error: 'Моля, попълнете всички полета' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Паролите не съвпадат' }, { status: 400 });
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Паролата не отговаря на изискванията за сигурност: ' + passwordErrors.join(', ')
      }, { status: 400 });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findUnique({
      where: { passwordResetToken: hashedToken },
    });

    if (!user) {
      return NextResponse.json({ error: 'Невалиден или изтекъл токен' }, { status: 400 });
    }

    if (new Date() > new Date(user.passwordResetTokenExpires)) {
      return NextResponse.json({ error: 'Токенът за нулиране на парола е изтекъл' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpires: null,
      },
    });

    return NextResponse.json({ message: 'Паролата е нулирана успешно' }, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Възникна вътрешна грешка в сървъра' }, { status: 500 });
  }
} 