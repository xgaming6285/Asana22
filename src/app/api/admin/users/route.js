import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireSuperAdmin } from "@/app/utils/auth";
import { decryptUsersArray, decryptUserData, encryptUserData } from "@/app/utils/encryption";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET all users (Super Admin only)
export async function GET(request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Get all users with their project memberships and goal memberships
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      include: {
        projectMemberships: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        goalMemberships: {
          include: {
            goal: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        },
        ownedGoals: {
          select: {
            id: true,
            title: true,
          }
        },
        createdTasks: {
          select: {
            id: true,
            title: true,
          }
        },
        _count: {
          select: {
            projectMemberships: true,
            goalMemberships: true,
            ownedGoals: true,
            createdTasks: true,
            tasks: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get total count for pagination
    const totalUsers = await prisma.user.count();

    // Decrypt user data
    const decryptedUsers = users.map(user => {
      const decryptedUser = decryptUserData(user);
      return {
        ...decryptedUser,
        projectMemberships: user.projectMemberships.map(membership => ({
          ...membership,
          project: membership.project
        })),
        goalMemberships: user.goalMemberships,
        ownedGoals: user.ownedGoals,
        createdTasks: user.createdTasks,
        _count: user._count,
      };
    });

    // Filter by search if provided
    const filteredUsers = search ? decryptedUsers.filter(user => 
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(search.toLowerCase())
    ) : decryptedUsers;

    return NextResponse.json({
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST create new user (Super Admin only)
export async function POST(request) {
  try {
    await requireSuperAdmin();

    const data = await request.json();
    const { email, firstName, lastName, password, systemRole = 'USER' } = data;

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: "Email, first name, and last name are required" }, { status: 400 });
    }

    // Check if user already exists
    const allUsers = await prisma.user.findMany();
    const existingUser = allUsers.find(u => decryptUserData(u).email === email);

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Encrypt user data
    const encryptedUserData = encryptUserData({
      email,
      firstName,
      lastName,
    });

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: encryptedUserData.email,
        firstName: encryptedUserData.firstName,
        lastName: encryptedUserData.lastName,
        password: hashedPassword,
        systemRole,
      },
    });

    // Decrypt user data before returning
    const decryptedUser = decryptUserData(newUser);

    return NextResponse.json(decryptedUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
} 