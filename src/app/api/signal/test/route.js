import { NextResponse } from 'next/server';
import signalService from '@/app/services/signalService';

export async function POST(req) {
    try {
        // For testing purposes, we'll skip authentication
        // In production, you might want to add authentication back

        const { phoneNumber, apiKey, message } = await req.json();

        if (!phoneNumber || !apiKey) {
            return new NextResponse('Phone number and API key are required', { status: 400 });
        }

        let success;
        if (message) {
            // Send custom message
            success = await signalService.sendMessage(phoneNumber, message, apiKey);
        } else {
            // Send test message
            success = await signalService.sendTestMessage(phoneNumber, apiKey);
        }

        if (success) {
            return NextResponse.json({
                message: 'Signal message sent successfully',
                success: true
            });
        } else {
            return new NextResponse('Failed to send Signal message', { status: 500 });
        }

    } catch (error) {
        console.error('Error in Signal test endpoint:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 