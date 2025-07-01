import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { decryptUsersArray } from "../../utils/encryption.js";

const prisma = new PrismaClient();

// Тази функция ще връща списък с всички потребители в системата
export async function GET(request) {
    try {
        const { userId: clerkId } = await auth();
        // Проверяваме дали потребителят, който прави заявката, е логнат
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Взимаме всички потребители от базата данни
        const users = await prisma.user.findMany({
            // Избираме само полетата, които са ни нужни за падащото меню
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                imageUrl: true,
            },
            orderBy: {
                firstName: 'asc', // Сортираме ги по първо име
            }
        });

        // Decrypt user data before returning
        const decryptedUsers = decryptUsersArray(users);

        return NextResponse.json(decryptedUsers);

    } catch (error) {
        console.error("API Users GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}