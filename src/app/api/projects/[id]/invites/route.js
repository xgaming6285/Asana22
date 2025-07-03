import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromToken, isSuperAdmin } from "../../../../utils/auth.js";
import { decryptProjectData, encryptUserData, decryptUserData } from "../../../../utils/encryption.js";
import { Resend } from 'resend';
import ProjectInvitationEmail from '@/app/components/emails/ProjectInvitation';
import signalService from '@/app/services/signalService';

const prisma = new PrismaClient();

// Get all invitations for a project
export async function GET(request, { params }) {
  try {
    const userId = await getUserIdFromToken();

    const { id: projectId } = await params;

    // Check if user is super admin or has permission to view invites
    const isUserSuperAdmin = await isSuperAdmin(userId);
    
    if (!isUserSuperAdmin) {
      const membership = await prisma.projectMembership.findFirst({
        where: {
          projectId: parseInt(projectId),
          userId: userId,
          role: {
            in: ["ADMIN", "CREATOR"],
          },
        },
      });

      if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const invitations = await prisma.projectMembership.findMany({
      where: {
        projectId: parseInt(projectId),
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    // Decrypt project and user data in invitations
    const decryptedInvitations = invitations.map(invitation => ({
      ...invitation,
      project: decryptProjectData(invitation.project),
      user: decryptUserData(invitation.user)
    }));

    return NextResponse.json(decryptedInvitations);
  } catch (error) {
    console.error("Error fetching project invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

// Create a new invitation
export async function POST(request, { params }) {
  try {
    const userId = await getUserIdFromToken();

    const { id: projectId } = await params;
    const { email, role, signalPhone, signalApiKey } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user is super admin or has permission to invite
    const isUserSuperAdmin = await isSuperAdmin(userId);
    
    if (!isUserSuperAdmin) {
      const membership = await prisma.projectMembership.findFirst({
        where: {
          projectId: parseInt(projectId),
          userId: userId,
          role: {
            in: ["ADMIN", "CREATOR"],
          },
        },
      });

      if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Get current user (inviter) information
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Decrypt user data to get the actual names
    const decryptedUser = decryptUserData(currentUser);

    // Get project information
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Decrypt project data
    const decryptedProject = decryptProjectData(project);

    // Find or create user (emails are encrypted, so we need to search through all users)
    const allUsers = await prisma.user.findMany();
    let user = null;
    
    for (const u of allUsers) {
      const decryptedUser = decryptUserData(u);
      if (decryptedUser.email === email) {
        user = u;
        break;
      }
    }

    if (!user) {
      // Create a new user if they don't exist
      const encryptedUserData = encryptUserData({
        email,
        firstName: "",
        lastName: "",
      });
      
      user = await prisma.user.create({
        data: {
          email: encryptedUserData.email,
          firstName: encryptedUserData.firstName,
          lastName: encryptedUserData.lastName,
        },
      });
    }

    // Check if user is already a member
    const existingMembership = await prisma.projectMembership.findFirst({
      where: {
        projectId: parseInt(projectId),
        userId: user.id,
        status: {
          in: ["ACTIVE", "PENDING"],
        },
      },
    });

    if (existingMembership) {
      if (existingMembership.status === "ACTIVE") {
        return NextResponse.json(
          { error: "User is already a member of this project" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "User already has a pending invitation" },
          { status: 400 }
        );
      }
    }

    // Create invitation
    const invitation = await prisma.projectMembership.create({
      data: {
        projectId: parseInt(projectId),
        userId: user.id,
        role: role || "USER",
        status: "PENDING",
        invitedBy: userId,
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        project: {
          select: {
            name: true,
            description: true,
          },
        },
      },
    });

    // Decrypt project and user data before returning
    const decryptedInvitation = {
      ...invitation,
      project: decryptProjectData(invitation.project),
      user: decryptUserData(invitation.user)
    };

    // Send email invitation
    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
        
        await resend.emails.send({
          from: 'Project Management <noreply@projectmanagement.com>',
          to: email,
          subject: `Invitation to join ${decryptedProject.name}`,
          react: ProjectInvitationEmail({
            projectName: decryptedProject.name,
            inviterName: `${decryptedUser.firstName} ${decryptedUser.lastName}`,
            inviteLink
          })
        });
        emailSent = true;
      } catch (error) {
        console.error('Failed to send email invitation:', error);
        // Don't fail the entire request if email fails
      }
    } else {
      console.warn('RESEND_API_KEY not configured, skipping email invitation');
    }

    // Send Signal message if phone and API key are provided
    let signalSent = false;
    if (signalPhone && signalApiKey) {
      try {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
        signalSent = await signalService.sendProjectInvitation(
          signalPhone,
          signalApiKey,
          {
            projectName: decryptedProject.name,
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
      ...decryptedInvitation,
      emailSent,
      signalSent
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "User already has a pending invitation" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
