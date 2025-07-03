import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request) {
  try {
    // Check if RESEND_API_KEY is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY is not configured',
        configured: false 
      }, { status: 500 });
    }

    // Check if NEXT_PUBLIC_APP_URL is configured
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json({ 
        error: 'NEXT_PUBLIC_APP_URL is not configured',
        configured: false 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Email configuration is properly set up',
      configured: true,
      resendApiKey: process.env.RESEND_API_KEY ? 'Set' : 'Not set',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set'
    }, { status: 200 });

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({ 
      error: 'Failed to test email configuration',
      configured: false 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 });
    }

    // Send a test email
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Test Email',
      html: '<h1>Test Email</h1><p>This is a test email to verify email configuration.</p>',
    });

    return NextResponse.json({ message: 'Test email sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error.message 
    }, { status: 500 });
  }
} 