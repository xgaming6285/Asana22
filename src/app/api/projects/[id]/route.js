import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET a specific project by ID
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// UPDATE a specific project by ID
export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const data = await request.json();
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error(`Error updating project ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE a specific project by ID
export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    await prisma.project.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 }
    ); // Or 204 No Content
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
