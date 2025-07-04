import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { decryptUserData } from "../../utils/encryption.js";
import { getUserIdFromToken, isSuperAdmin } from "../../utils/auth.js";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const userId = await getUserIdFromToken();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    console.log("Checking membership for:", {
      projectId: parseInt(projectId),
      userId: userId,
    });

    // Check if user is super admin or has membership to the project
    const isUserSuperAdmin = await isSuperAdmin(userId);
    
    if (!isUserSuperAdmin) {
      const userMembership = await prisma.projectMembership.findFirst({
        where: {
          projectId: parseInt(projectId),
          userId: userId,
          status: "ACTIVE",
        },
      });

      if (!userMembership) {
        return NextResponse.json(
          { error: "You don't have access to this project" },
          { status: 403 }
        );
      }
    }

    const members = await prisma.projectMembership.findMany({
      where: {
        projectId: parseInt(projectId),
        status: "ACTIVE",
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
      },
    });

    const formattedMembers = members.map((membership) => {
      const decryptedUser = decryptUserData(membership.user);
      return {
        id: decryptedUser.id,
        email: decryptedUser.email,
        firstName: decryptedUser.firstName,
        lastName: decryptedUser.lastName,
        imageUrl: decryptedUser.imageUrl,
        role: membership.role,
        userId: membership.userId,
      };
    });

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error("Error fetching project members:", error);
    return NextResponse.json(
      { error: "Failed to fetch project members" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromToken();

    const body = await request.json();
    const { projectId, email, role } = body;

    if (!projectId || !email || !role) {
      return NextResponse.json(
        { error: "Project ID, email, and role are required" },
        { status: 400 }
      );
    }

    // Check if user is super admin or has permission to invite members
    const isUserSuperAdmin = await isSuperAdmin(userId);
    
    if (!isUserSuperAdmin) {
      const inviterMembership = await prisma.projectMembership.findFirst({
        where: {
          projectId: parseInt(projectId),
          userId: userId,
          status: "ACTIVE",
          role: { in: ["ADMIN", "CREATOR"] },
        },
      });

      if (!inviterMembership) {
        return NextResponse.json(
          { error: "You don't have permission to invite members" },
          { status: 403 }
        );
      }
    }

    const allUsers = await prisma.user.findMany();
    const invitedUser = allUsers.find(u => decryptUserData(u).email === email);

    if (!invitedUser) {
      return NextResponse.json(
        { error: "User not found with this email" },
        { status: 404 }
      );
    }

    const existingMembership = await prisma.projectMembership.findFirst({
      where: {
        projectId: parseInt(projectId),
        userId: invitedUser.id,
      },
    });

    if (existingMembership) {
      if (existingMembership.status === "ACTIVE") {
        return NextResponse.json(
          { error: "User is already a member of this project" },
          { status: 400 }
        );
      } else if (existingMembership.status === "PENDING") {
        return NextResponse.json(
          { error: "User already has a pending invitation" },
          { status: 400 }
        );
      }
    }

    const membership = await prisma.projectMembership.create({
      data: {
        projectId: parseInt(projectId),
        userId: invitedUser.id,
        role,
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
      },
    });

    // Decrypt user data before returning
    const decryptedMembership = {
      ...membership,
      user: decryptUserData(membership.user)
    };

    return NextResponse.json(decryptedMembership);
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
