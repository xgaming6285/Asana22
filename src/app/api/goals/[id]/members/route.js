import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/app/utils/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request, context) {
    try {
        const url = new URL(request.url);
        const goalId = parseInt(url.pathname.split('/')[3]);

        const userId = await getUserIdFromToken();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { userIdToAdd } = await request.json();

        if (isNaN(goalId) || !userIdToAdd) {
            return NextResponse.json({ error: "Valid Goal ID and User ID to add are required" }, { status: 400 });
        }

        const goal = await prisma.goal.findUnique({
            where: { id: goalId },
            include: { members: true },
        });

        if (!goal) {
            return NextResponse.json({ error: "Goal not found" }, { status: 404 });
        }

        const userMembership = goal.members.find(m => m.userId === user.id);
        const canEdit = goal.ownerId === user.id || (goal.type === 'TEAM' && userMembership?.role === 'EDITOR');

        if (!canEdit) {
            return NextResponse.json({ error: "You don't have permission to add members to this goal" }, { status: 403 });
        }

        const existingMembership = await prisma.goalMembership.findUnique({
            where: { goalId_userId: { goalId, userId: userIdToAdd } }
        });

        if (existingMembership) {
            return NextResponse.json({ error: "User is already a member of this goal" }, { status: 409 });
        }

        const newMembership = await prisma.goalMembership.create({
            data: {
                goalId: goalId,
                userId: userIdToAdd,
                role: 'MEMBER',
            },
            include: {
                user: true
            }
        });

        return NextResponse.json(newMembership, { status: 201 });
    } catch (error) {
        console.error("Add Goal Member Error:", error);
        return NextResponse.json({ error: "Failed to add member to goal" }, { status: 500 });
    }
}

export async function DELETE(request, context) {
    try {
        const url = new URL(request.url);
        const goalId = parseInt(url.pathname.split('/')[3]);

        const userId = await getUserIdFromToken();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userIdToRemove = parseInt(request.nextUrl.searchParams.get('userIdToRemove'));

        if (isNaN(goalId) || isNaN(userIdToRemove)) {
            return NextResponse.json({ error: "Valid Goal ID and User ID to remove are required" }, { status: 400 });
        }

        const goal = await prisma.goal.findUnique({
            where: { id: goalId },
            include: { members: true },
        });

        if (!goal) {
            return NextResponse.json({ error: "Goal not found" }, { status: 404 });
        }

        const userMembership = goal.members.find(m => m.userId === user.id);
        const canEdit = goal.ownerId === user.id || (goal.type === 'TEAM' && userMembership?.role === 'EDITOR');

        if (!canEdit) {
            return NextResponse.json({ error: "You don't have permission to remove members from this goal" }, { status: 403 });
        }

        if (goal.ownerId === userIdToRemove) {
            return NextResponse.json({ error: "The goal owner cannot be removed as a member." }, { status: 400 });
        }

        await prisma.goalMembership.delete({
            where: {
                goalId_userId: {
                    goalId: goalId,
                    userId: userIdToRemove,
                },
            },
        });

        return new Response(null, { status: 204 });

    } catch (error) {
        console.error("Remove Goal Member Error:", error);
        return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
    }
}