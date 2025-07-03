import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireSuperAdmin } from "@/app/utils/auth";

const prisma = new PrismaClient();

// GET admin dashboard overview (Super Admin only)
export async function GET(request) {
  try {
    await requireSuperAdmin();

    // Get system-wide statistics
    const [
      totalUsers,
      totalProjects,
      totalTasks,
      totalGoals,
      totalMessages,
      totalFiles,
      superAdmins,
      recentUsers,
      recentProjects,
      tasksByStatus,
      goalsByType,
      projectsByMemberCount,
    ] = await Promise.all([
      // Basic counts
      prisma.user.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.goal.count(),
      prisma.message.count(),
      prisma.file.count(),
      
      // Super admin count
      prisma.user.count({
        where: { systemRole: 'SUPER_ADMIN' }
      }),
      
      // Recent users (last 30 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Recent projects (last 30 days)
      prisma.project.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Tasks by status
      prisma.task.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      }),
      
      // Goals by type
      prisma.goal.groupBy({
        by: ['type'],
        _count: {
          id: true
        }
      }),
      
      // Projects by member count
      prisma.project.findMany({
        select: {
          id: true,
          _count: {
            select: {
              projectMemberships: {
                where: {
                  status: 'ACTIVE'
                }
              }
            }
          }
        }
      }),
    ]);

    // Process project member count data
    const memberCountDistribution = {
      '1': 0,
      '2-5': 0,
      '6-10': 0,
      '11-20': 0,
      '21+': 0
    };

    projectsByMemberCount.forEach(project => {
      const memberCount = project._count.projectMemberships;
      if (memberCount === 1) {
        memberCountDistribution['1']++;
      } else if (memberCount <= 5) {
        memberCountDistribution['2-5']++;
      } else if (memberCount <= 10) {
        memberCountDistribution['6-10']++;
      } else if (memberCount <= 20) {
        memberCountDistribution['11-20']++;
      } else {
        memberCountDistribution['21+']++;
      }
    });

    // Get recent activity (last 7 days)
    const recentActivity = await Promise.all([
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),
      
      prisma.project.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),
      
      prisma.task.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),
    ]);

    const dashboard = {
      overview: {
        totalUsers,
        totalProjects,
        totalTasks,
        totalGoals,
        totalMessages,
        totalFiles,
        superAdmins,
        recentUsers,
        recentProjects,
      },
      analytics: {
        tasksByStatus: tasksByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {}),
        goalsByType: goalsByType.reduce((acc, item) => {
          acc[item.type] = item._count.id;
          return acc;
        }, {}),
        projectMemberDistribution: memberCountDistribution,
      },
      recentActivity: {
        users: recentActivity[0],
        projects: recentActivity[1],
        tasks: recentActivity[2],
      }
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    if (error.message === 'Super admin access required') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
} 