import { NextResponse } from "next/server";
import {
  createFile,
  getProjectFiles,
  deleteFile,
  updateFile,
} from "@/app/services/fileService";
import membershipService from "@/app/services/membershipService";
import { getUserIdFromToken } from "../../utils/auth.js";

export async function POST(req) {
  try {
    const userId = await getUserIdFromToken();

    const data = await req.json();
    const { projectId } = data;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const membership = await membershipService.getProjectMember(
      parseInt(projectId),
      userId
    );
    if (!membership) {
      return NextResponse.json(
        { error: "Unauthorized - Not a project member" },
        { status: 401 }
      );
    }

    const file = await createFile({
      ...data,
      url: `https://example.com/files/${Date.now()}-${data.name}`,
      uploaderId: userId,
    });

    return NextResponse.json(file);
  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create file" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const userId = await getUserIdFromToken();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const membership = await membershipService.getProjectMember(
      parseInt(projectId),
      userId
    );
    if (!membership) {
      return NextResponse.json(
        { error: "Unauthorized - Not a project member" },
        { status: 401 }
      );
    }

    const files = await getProjectFiles(parseInt(projectId));
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error getting files:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get files" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const userId = await getUserIdFromToken();

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    await deleteFile(parseInt(fileId), userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const userId = await getUserIdFromToken();

    const data = await req.json();
    const { fileId, ...updateData } = data;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    const updatedFile = await updateFile(parseInt(fileId), updateData, userId);
    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update file" },
      { status: 500 }
    );
  }
}