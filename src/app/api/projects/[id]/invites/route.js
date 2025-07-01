import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { decryptProjectData } from "../../../../utils/encryption.js";

const prisma = new PrismaClient();

// Get all invitations for a project
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Check if user has permission to view invites
    const membership = await prisma.projectMembership.findFirst({
      where: {
        projectId: parseInt(projectId),
        user: {
          clerkId: userId,
        },
        role: {
          in: ["ADMIN", "CREATOR"],
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
            clerkId: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    // Decrypt project data in invitations
    const decryptedInvitations = invitations.map(invitation => ({
      ...invitation,
      project: decryptProjectData(invitation.project)
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { email, role } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user has permission to invite
    const membership = await prisma.projectMembership.findFirst({
      where: {
        projectId: parseInt(projectId),
        user: {
          clerkId: userId,
        },
        role: {
          in: ["ADMIN", "CREATOR"],
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      // Create a new user if they don't exist
      user = await prisma.user.create({
        data: {
          email,
          firstName: "",
          lastName: "",
          clerkId: "", // Empty string for now, will be set when they sign up
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
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            clerkId: true,
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

    // Decrypt project data before returning
    const decryptedInvitation = {
      ...invitation,
      project: decryptProjectData(invitation.project)
    };

    // Here you could add email notification logic
    // For example, send an email to the invited user

    return NextResponse.json(decryptedInvitation);
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
