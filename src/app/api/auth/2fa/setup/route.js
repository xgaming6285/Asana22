import { PrismaClient } from '@prisma/client';
import { authenticator } from 'otplib';
import { getUserIdFromToken } from '../../../../utils/auth';
import { NextResponse } from 'next/server';
import { decryptUserData, encryptUserData } from '../../../../utils/encryption';

const prisma = new PrismaClient();
const APP_NAME = 'Asana22';

export async function POST(request) {
  try {
    const userId = await getUserIdFromToken();
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: 'Потребителят не е намерен' }, { status: 404 });
    }

    const decryptedUser = decryptUserData(user);
    const userEmail = decryptedUser.email;
    
    // Generate a new secret for the user
    const secret = authenticator.generateSecret();
    
    // Update the user's record with the new secret
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        // We don't enable it until they verify the code
        isTwoFactorEnabled: false, 
      },
    });

    // Generate the OTP Auth URL
    const otpauth = authenticator.keyuri(userEmail, APP_NAME, secret);

    return NextResponse.json({ otpauth });

  } catch (error) {
    console.error('2FA setup error:', error);
    if (error.message === 'Not authenticated' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Неоторизиран достъп' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Възникна грешка при настройката на 2FA' }, { status: 500 });
  }
} 