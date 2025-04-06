"use server"

import { db } from "./db"
import { auth } from "@clerk/nextjs/server"
import { PrismaClient } from "@prisma/client"

// Type assertion for db to recognize all models
type DbClient = {
  user: any;
  course: any;
  project: any;
  activity: any;
  session: any;
  streak: any;
}

// Use the db with type assertion
const typedDb = db as unknown as DbClient;

// This function will be used to initialize a user in our database
// when they first sign in with Clerk
export async function initUser() {
  // Get the current user from Clerk
  const session = await auth()
  const user_id = session.userId
  
  if (!user_id) {
    return null
  }
  
  // Check if the user already exists in our database
  const existingUser = await typedDb.user.findUnique({
    where: { user_id }
  })
  
  if (existingUser) {
    return existingUser
  }
  
  // If the user doesn't exist, the webhook should handle creation.
  // We log a warning here as the user should ideally exist by now.
  console.warn(`initUser: User with Clerk ID ${user_id} not found in DB. Webhook might be delayed or failed.`);
  return null; // Stop execution here, do not create user or demo data
}
