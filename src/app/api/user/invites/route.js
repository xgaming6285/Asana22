import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { decryptProjectData, decryptUserData } from "../../../utils/encryption.js";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all pending invitations for the user
    const invitations = await prisma.projectMembership.findMany({
      where: {
        user: {
          clerkId: userId,
        },
        status: "PENDING",
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Decrypt project and user data before returning
    const decryptedInvitations = invitations.map(invitation => ({
      ...invitation,
      project: decryptProjectData(invitation.project),
      user: decryptUserData(invitation.user)
    }));

    return NextResponse.json(decryptedInvitations);
  } catch (error) {
    console.error("Error fetching user invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}
