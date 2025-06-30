import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: inviteId } = await params;
    const user = await currentUser();

    if (!inviteId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      );
    }

    let dbUser = await prisma.user.findFirst({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.emailAddresses[0].emailAddress,
          clerkId,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
      });
    } else if (!dbUser.clerkId) {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          clerkId,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
      });
    }

    const invitation = await prisma.projectMembership.findFirst({
      where: {
        id: parseInt(inviteId),
        status: "PENDING",
        user: {
          email: user.emailAddresses[0].emailAddress,
        },
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
            clerkId: true,
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
            clerkId: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMembership);
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
