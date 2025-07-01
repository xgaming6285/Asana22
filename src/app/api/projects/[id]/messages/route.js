import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { decryptUserData } from "../../../../utils/encryption.js";

const prisma = new PrismaClient();

// GET all messages for a project
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const projectId = parseInt(id);

    // Get the internal user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in the system" },
        { status: 404 }
      );
    }

    // Check if user is a member of the project
    const membership = await prisma.projectMembership.findFirst({
      where: {
        userId: user.id,
        projectId: projectId,
        status: "ACTIVE",
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all messages for the project
    const messages = await prisma.message.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        user: {
          select: {
            clerkId: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Decrypt user data in messages before returning
    const decryptedMessages = messages.map(message => ({
      ...message,
      user: decryptUserData(message.user)
    }));

    return NextResponse.json(decryptedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST a new message to a project
export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const projectId = parseInt(id);
    const { text } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Message text is required" },
        { status: 400 }
      );
    }

    // Get the internal user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in the system" },
        { status: 404 }
      );
    }

    // Check if user is a member of the project
    const membership = await prisma.projectMembership.findFirst({
      where: {
        userId: user.id,
        projectId: projectId,
        status: "ACTIVE",
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        text: text.trim(),
        projectId: projectId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            clerkId: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    // Decrypt user data before returning
    const decryptedMessage = {
      ...message,
      user: decryptUserData(message.user)
    };

    return NextResponse.json(decryptedMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
