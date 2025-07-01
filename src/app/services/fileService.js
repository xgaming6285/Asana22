import { PrismaClient } from "@prisma/client";
import { decryptUserData } from "../utils/encryption.js";
const prisma = new PrismaClient();

export async function createFile(data) {
  try {
    // First, get the user's internal ID using their Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: data.uploaderId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const file = await prisma.file.create({
      data: {
        name: data.name,
        url: data.url,
        size: data.size,
        type: data.type,
        project: {
          connect: {
            id: parseInt(data.projectId),
          },
        },
        uploader: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        uploader: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    // Decrypt user data before returning
    return {
      ...file,
      uploader: decryptUserData(file.uploader)
    };
  } catch (error) {
    console.error("Error in createFile:", error);
    throw error;
  }
}

export async function getProjectFiles(projectId) {
  const files = await prisma.file.findMany({
    where: {
      projectId: parseInt(projectId),
    },
    include: {
      uploader: {
        select: {
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Decrypt user data before returning
  return files.map(file => ({
    ...file,
    uploader: decryptUserData(file.uploader)
  }));
}

export async function deleteFile(fileId, clerkId) {
  try {
    // Get the user's internal ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        project: {
          include: {
            projectMemberships: {
              where: {
                userId: user.id,
                role: { in: ["ADMIN", "CREATOR"] },
              },
            },
          },
        },
      },
    });

    if (!file) {
      throw new Error("File not found");
    }

    // Check if user has permission to delete
    if (
      file.uploaderId !== user.id &&
      file.project.projectMemberships.length === 0
    ) {
      throw new Error("Unauthorized to delete this file");
    }

    return await prisma.file.delete({
      where: { id: fileId },
    });
  } catch (error) {
    console.error("Error in deleteFile:", error);
    throw error;
  }
}

export async function updateFile(fileId, data, clerkId) {
  try {
    // Get the user's internal ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        project: {
          include: {
            projectMemberships: {
              where: {
                userId: user.id,
                role: { in: ["ADMIN", "CREATOR"] },
              },
            },
          },
        },
      },
    });

    if (!file) {
      throw new Error("File not found");
    }

    // Check if user has permission to update
    if (
      file.uploaderId !== user.id &&
      file.project.projectMemberships.length === 0
    ) {
      throw new Error("Unauthorized to update this file");
    }

    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data,
      include: {
        uploader: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    // Decrypt user data before returning
    return {
      ...updatedFile,
      uploader: decryptUserData(updatedFile.uploader)
    };
  } catch (error) {
    console.error("Error in updateFile:", error);
    throw error;
  }
}
