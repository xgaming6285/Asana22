import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromToken } from "../../../../utils/auth.js";
import { encryptUserData, decryptUserData } from "../../../../utils/encryption.js";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const userId = await getUserIdFromToken();

    const { id: inviteId } = await params;

    if (!inviteId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      );
    }

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Decrypt user data to get the actual email
    const decryptedUser = decryptUserData(currentUser);

    // Find the invitation (need to handle encrypted emails)
    const invitation = await prisma.projectMembership.findFirst({
      where: {
        id: parseInt(inviteId),
        status: "PENDING",
        userId: userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
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
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found or already processed" },
        { status: 404 }
      );
    }

    // Update membership status to ACTIVE
    const updatedMembership = await prisma.projectMembership.update({
      where: {
        id: parseInt(inviteId),
      },
      data: {
        status: "ACTIVE",
        joinedAt: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
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
    });

    // Decrypt user data before returning
    const decryptedMembership = {
      ...updatedMembership,
      user: decryptUserData(updatedMembership.user)
    };

    return NextResponse.json(decryptedMembership);
  } catch (error) {
    console.error("Error accepting invitation:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
