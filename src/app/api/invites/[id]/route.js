import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { db } from '@/app/lib/db';

export async function GET(req, { params }) {
    try {
        const user = await currentUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

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

        if (invitation.email !== user.emailAddresses[0].emailAddress) {
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
        const user = await currentUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

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

        if (invitation.email !== user.emailAddresses[0].emailAddress) {
            return new NextResponse('This invitation is not for you', { status: 403 });
        }

        await db.projectMember.create({
            data: {
                projectId: invitation.projectId,
                userId: user.id,
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
