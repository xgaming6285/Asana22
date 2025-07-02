import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { decryptUserData } from "../../../../utils/encryption.js";
import { getUserIdFromToken } from "../../../../utils/auth.js";

const prisma = new PrismaClient();

// GET all messages for a project
export async function GET(request, { params }) {
  try {
    const userId = await getUserIdFromToken();

    const { id } = await params;
    const projectId = parseInt(id);

    // Check if user is a member of the project
    const membership = await prisma.projectMembership.findFirst({
      where: {
        userId: userId,
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
    const userId = await getUserIdFromToken();

    const { id } = await params;
    const projectId = parseInt(id);
    const { text } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Message text is required" },
        { status: 400 }
      );
    }

    // Check if user is a member of the project
    const membership = await prisma.projectMembership.findFirst({
      where: {
        userId: userId,
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
        userId: userId,
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
