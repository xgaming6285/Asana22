import { Webhook } from "svix";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  console.log(
    "ℹ️ Received HTTP GET to /api/clerk - This endpoint expects POST."
  );
  return new Response("Webhook handler is active. Expecting POST requests.", {
    status: 200,
  });
}

export async function POST(request) {
  console.log("🔥 Received HTTP POST to /api/clerk");
  console.log("DEBUG: Starting webhook processing...");

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  console.log("DEBUG: WEBHOOK_SECRET exists:", !!WEBHOOK_SECRET);

  if (!WEBHOOK_SECRET) {
    console.error(
      "❌ CLERK_WEBHOOK_SECRET is not set in environment variables."
    );
    return new Response(
      "Internal Server Error: Webhook secret not configured",
      { status: 500 }
    );
  }

  // Debug headers
  const hdrs = headers();
  const headersList = Array.from(hdrs.entries());
  console.log("DEBUG: All received headers:", headersList);

  const svix_id = hdrs.get("svix-id");
  const svix_timestamp = hdrs.get("svix-timestamp");
  const svix_signature = hdrs.get("svix-signature");

  console.log("DEBUG: Svix Headers:", {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature?.substring(0, 20) + "...", // Only log part of the signature for security
  });

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error(
      "❌ Missing one or more Svix headers. svix-id:",
      svix_id,
      "svix-timestamp:",
      svix_timestamp,
      "svix-signature:",
      svix_signature
    );
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  let payload;
  let body;
  try {
    body = await request.text(); // First get the raw body
    console.log(
      "DEBUG: Raw request body received:",
      body.substring(0, 200) + "..."
    );

    payload = JSON.parse(body);
    console.log("DEBUG: Parsed payload:", JSON.stringify(payload, null, 2));
  } catch (jsonError) {
    console.error("❌ Error parsing request body:", {
      error: jsonError.message,
      stack: jsonError.stack,
    });
    return new Response("Error: Invalid JSON payload", { status: 400 });
  }

  console.log("DEBUG: Attempting to verify webhook signature...");
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
    console.log("✅ Svix signature verification successful:", {
      eventType: evt.type,
      eventId: evt.id,
      userId: evt.data?.id,
    });
  } catch (err) {
    console.error("🚨 Webhook signature verification failed:", {
      error: err.message,
      stack: err.stack,
      receivedSignature: svix_signature?.substring(0, 20) + "...",
      timestamp: svix_timestamp,
      bodyPreview: body.substring(0, 100) + "...",
    });
    return new Response("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;
  const userData = evt.data;

  try {
    console.log("DEBUG: Processing webhook event:", {
      type: eventType,
      userId: userData.id,
      emailAddresses: userData.email_addresses,
      firstName: userData.first_name,
      lastName: userData.last_name,
    });

    switch (eventType) {
      case "user.created":
      case "user.updated":
        console.log(`⚙️ Processing ${eventType} event:`, {
          clerkId: userData.id,
          emailData: userData.email_addresses,
          firstName: userData.first_name,
          lastName: userData.last_name,
          imageUrl: userData.image_url,
        });

        const email = userData.email_addresses?.[0]?.email_address;

        if (eventType === "user.created" && !email) {
          console.warn(
            `⚠️ User ${userData.id} created without a primary email address. Using placeholder if email is required.`
          );
        }

        const dataToUpsert = {
          clerkId: userData.id,

          email: email ?? `placeholder-${userData.id}@example.com`,
          firstName: userData.first_name || null,
          lastName: userData.last_name || null,
          imageUrl: userData.image_url || null,
        };
        console.log(
          "Webhook Handler: Data prepared for Prisma upsert:",
          dataToUpsert
        );

        const upsertedUser = await prisma.user.upsert({
          where: { clerkId: userData.id },
          create: dataToUpsert,
          update: {
            email: email ?? undefined,
            firstName: userData.first_name || null,
            lastName: userData.last_name || null,
            imageUrl: userData.image_url || null,
            updatedAt: new Date(),
          },
        });
        console.log("✅ Database operation result:", {
          operation: eventType,
          result: upsertedUser,
          timestamp: new Date().toISOString(),
        });
        break;

      case "user.deleted":
        const userIdToDelete = userData.id;
        if (userIdToDelete) {
          console.log(`🗑 Deleting user with Clerk ID: ${userIdToDelete}…`);
          const existingUser = await prisma.user.findUnique({
            where: { clerkId: userIdToDelete },
          });
          if (existingUser) {
            await prisma.user.delete({ where: { clerkId: userIdToDelete } });
            console.log(
              "✅ Prisma delete Succeeded for user ID:",
              userIdToDelete
            );
          } else {
            console.warn(
              `ℹ️ User with Clerk ID ${userIdToDelete} not found in DB for deletion.`
            );
          }
        } else {
          console.warn(
            "ℹ️ user.deleted event received, but Clerk ID missing in evt.data:",
            JSON.stringify(evt.data, null, 2)
          );
        }
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${eventType}`);
    }

    console.log(
      "Webhook Handler: Event processed successfully for event:",
      eventType,
      "Returning 200 OK"
    );
    return new Response("OK", { status: 200 });
  } catch (dbErr) {
    console.error("🚨 Webhook Handler Error:", {
      error: dbErr.message,
      stack: dbErr.stack,
      eventType,
      userData: JSON.stringify(userData),
      timestamp: new Date().toISOString(),
    });
    return new Response(`Webhook processing error: ${dbErr.message}`, {
      status: 500,
    });
  }
}
