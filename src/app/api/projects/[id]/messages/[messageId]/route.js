import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromToken } from "../../../../../utils/auth.js";

const prisma = new PrismaClient();

// PATCH /api/projects/[id]/messages/[messageId]
export async function PATCH(req, { params }) {
  try {
    const userId = await getUserIdFromToken();

    const { id, messageId } = await params;
    const projectId = parseInt(id);
    const messageIdInt = parseInt(messageId);
    const { text } = await req.json();

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

    // Get the message and check ownership
    const message = await prisma.message.findUnique({
      where: { id: messageIdInt },
      include: {
        user: true,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: messageIdInt },
      data: { text: text.trim() },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/messages/[messageId]
export async function DELETE(req, { params }) {
  try {
    const userId = await getUserIdFromToken();

    const { messageId } = await params;
    const messageIdInt = parseInt(messageId);

    // Get the message and check ownership
    const message = await prisma.message.findUnique({
      where: { id: messageIdInt },
      include: {
        user: true,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageIdInt },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
