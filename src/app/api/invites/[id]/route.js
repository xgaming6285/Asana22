import { NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/app/utils/auth';
import { db } from '@/app/lib/db';
import { decryptUserData } from '@/app/utils/encryption';

export async function GET(req, { params }) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Get current user from database
        const currentUser = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });

        if (!currentUser) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Decrypt user data to get the actual email
        const decryptedUser = decryptUserData(currentUser);

        const { id } = await params;
        const invitation = await db.projectInvitation.findUnique({
            where: {
                id: id,
                status: 'PENDING',
                expiresAt: {
                    gt: new Date()
                }
            },
            include: {
                project: true
            }
        });

        if (!invitation) {
            return new NextResponse('Invitation not found or expired', { status: 404 });
        }

        if (invitation.email !== decryptedUser.email) {
            return new NextResponse('This invitation is not for you', { status: 403 });
        }

        return NextResponse.json({
            invitation,
            project: invitation.project
        });

    } catch (error) {
        console.error('Error fetching invitation:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Get current user from database
        const currentUser = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });

        if (!currentUser) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Decrypt user data to get the actual email
        const decryptedUser = decryptUserData(currentUser);

        const { id } = await params;
        const invitation = await db.projectInvitation.findUnique({
            where: {
                id: id,
                status: 'PENDING',
                expiresAt: {
                    gt: new Date()
                }
            }
        });

        if (!invitation) {
            return new NextResponse('Invitation not found or expired', { status: 404 });
        }

        if (invitation.email !== decryptedUser.email) {
            return new NextResponse('This invitation is not for you', { status: 403 });
        }

        await db.projectMember.create({
            data: {
                projectId: invitation.projectId,
                userId: userId,
                role: 'MEMBER'
            }
        });

        await db.projectInvitation.update({
            where: {
                id: id
            },
            data: {
                status: 'ACCEPTED'
            }
        });

        return NextResponse.json({
            message: 'Invitation accepted successfully'
        });

    } catch (error) {
        console.error('Error accepting invitation:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
