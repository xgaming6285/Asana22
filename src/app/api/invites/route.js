import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/app/utils/auth';
import { db } from '@/app/lib/db';
import { decryptUserData } from '@/app/utils/encryption';
import ProjectInvitationEmail from '@/app/components/emails/ProjectInvitation';
import signalService from '@/app/services/signalService';

export async function POST(req) {
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

        // Decrypt user data to get the actual names
        const decryptedUser = decryptUserData(currentUser);

        const { projectId, email, signalPhone, signalApiKey } = await req.json();

        if (!projectId || !email) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const project = await db.project.findFirst({
            where: {
                id: projectId,
                members: {
                    some: {
                        userId: userId
                    }
                }
            }
        });

        if (!project) {
            return new NextResponse('Project not found or access denied', { status: 404 });
        }

        const existingMember = await db.projectMember.findFirst({
            where: {
                projectId,
                user: {
                    email
                }
            }
        });

        if (existingMember) {
            return new NextResponse('User is already a member of this project', { status: 400 });
        }

        const invitation = await db.projectInvitation.create({
            data: {
                projectId,
                email,
                inviterId: userId,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
        });

        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.id}`;

        // Send email invitation
        let emailSent = false;
        if (process.env.RESEND_API_KEY) {
            try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                await resend.emails.send({
                    from: 'Project Management <noreply@projectmanagement.com>',
                    to: email,
                    subject: `Invitation to join ${project.name}`,
                    react: ProjectInvitationEmail({
                        projectName: project.name,
                        inviterName: `${decryptedUser.firstName} ${decryptedUser.lastName}`,
                        inviteLink
                    })
                });
                emailSent = true;
            } catch (error) {
                console.error('Failed to send email invitation:', error);
                // Don't fail the entire request if email fails during build
            }
        } else {
            console.warn('RESEND_API_KEY not configured, skipping email invitation');
        }

        // Send Signal message if phone and API key are provided
        let signalSent = false;
        if (signalPhone && signalApiKey) {
            try {
                signalSent = await signalService.sendProjectInvitation(
                    signalPhone,
                    signalApiKey,
                    {
                        projectName: project.name,
                        inviterName: `${decryptedUser.firstName} ${decryptedUser.lastName}`,
                        inviteLink
                    }
                );
            } catch (error) {
                console.error('Failed to send Signal message:', error);
                // Don't fail the entire request if Signal fails
            }
        }

        return NextResponse.json({
            message: 'Invitation sent successfully',
            invitationId: invitation.id,
            emailSent: emailSent,
            signalSent: signalSent
        });

    } catch (error) {
        console.error('Error sending invitation:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
