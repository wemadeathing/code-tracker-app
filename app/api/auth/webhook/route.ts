import { db } from "@/lib/db";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { checkDbConnection } from "@/lib/db";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing WEBHOOK_SECRET environment variable");
    return new Response("Server configuration error", {
      status: 500,
    });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers:", { svix_id, svix_timestamp, svix_signature });
    return new Response("Error occurred -- missing Svix headers", {
      status: 400,
    });
  }

  // Validate the request body
  let payload;
  let body;
  
  try {
    payload = await req.json();
    body = JSON.stringify(payload);
    
    if (!payload?.data?.id) {
      console.error("Invalid webhook payload - missing user ID:", payload);
      return new Response("Invalid webhook payload", { 
        status: 400 
      });
    }
  } catch (parseError) {
    console.error("Error parsing request body:", parseError);
    return new Response("Error parsing request body", { 
      status: 400 
    });
  }

  // Create a new SVIX instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook signature", {
      status: 401,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;
  
  console.log(`Processing webhook event: ${eventType} for user: ${payload?.data?.id}`);

  // Check database connection before proceeding
  const isConnected = await checkDbConnection().catch(() => false);
  if (!isConnected) {
    console.error("Database connection failed when handling webhook");
    return NextResponse.json({
      status: 503,
      message: "Database connection error",
    });
  }

  try {
    // Extract common user data
    const userData = {
      email: payload?.data?.email_addresses?.[0]?.email_address,
      first_name: payload?.data?.first_name || "",
      last_name: payload?.data?.last_name || "",
      profile_image_url: payload?.data?.profile_image_url || "",
    };

    switch (eventType) {
      case "user.created":
        console.log(`Creating new user: ${payload?.data?.id}, email: ${userData.email}`);
        
        // First check if user already exists (handle duplicate events)
        const existingUser = await db.user.findUnique({
          where: { user_id: payload?.data?.id }
        });
        
        if (existingUser) {
          console.log(`User ${payload?.data?.id} already exists, updating instead`);
          await db.user.update({
            where: { user_id: payload?.data?.id },
            data: userData,
          });
        } else {
          // Create new user
          await db.user.create({
            data: {
              user_id: payload?.data?.id,
              ...userData,
            },
          });
        }

        return NextResponse.json({
          status: 200,
          message: "User created/updated successfully",
        });

      case "user.updated":
        console.log(`Updating user: ${payload?.data?.id}, email: ${userData.email}`);
        
        // Check if user exists before updating
        const userToUpdate = await db.user.findUnique({
          where: { user_id: payload?.data?.id }
        });
        
        if (!userToUpdate) {
          console.log(`User ${payload?.data?.id} not found for update, creating instead`);
          await db.user.create({
            data: {
              user_id: payload?.data?.id,
              ...userData,
            },
          });
        } else {
          await db.user.update({
            where: { user_id: payload?.data?.id },
            data: userData,
          });
        }

        return NextResponse.json({
          status: 200,
          message: "User updated successfully",
        });

      default:
        console.log(`Ignoring unhandled event type: ${eventType}`);
        return NextResponse.json({
          status: 200,
          message: "Event type ignored",
        });
    }
  } catch (error: any) {
    // Detailed error logging
    console.error("Webhook handler error:", {
      errorMessage: error.message,
      errorCode: error.code,
      errorName: error.name,
      errorStack: error.stack,
      prismaError: error.meta || {},
      userId: payload?.data?.id,
      email: payload?.data?.email_addresses?.[0]?.email_address,
      eventType,
    });
    
    // If it's a database constraint error, return a more specific message
    if (error.code === 'P2002') {
      return NextResponse.json({
        status: 409,
        message: "User with this email already exists",
      });
    }
    
    return NextResponse.json({
      status: 500,
      message: `Server error: ${error.message}`,
    });
  }
}