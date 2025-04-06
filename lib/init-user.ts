"use server"

import { db } from "./db"
import { auth, currentUser } from "@clerk/nextjs/server"

// This function will be used to initialize a user in our database
// when they first sign in with Clerk
export async function initUser() {
  try {
    // Get the current user from Clerk
    const session = await auth()
    
    // Important - handle empty session objects properly
    const user_id = session?.userId || null
    
    if (!user_id) {
      console.log("No user ID found in session, session:", session)
      return null
    }
    
    try {
      // Check if the user already exists in our database
      const existingUser = await db.user.findUnique({
        where: { user_id }
      })
      
      if (existingUser) {
        return existingUser
      }
      
      // Get full user profile from Clerk for email and other details
      const userProfile = await currentUser()
      if (!userProfile) {
        console.error("Could not fetch user profile from Clerk")
        throw new Error("User profile not found")
      }
      
      console.log("Creating new user with Clerk ID:", user_id)
      
      // Create the user in our database with their actual profile data
      const newUser = await db.user.create({
        data: {
          user_id,
          email: userProfile.emailAddresses[0]?.emailAddress || `${user_id}@example.com`, // Fallback email to avoid empty string
          first_name: userProfile.firstName || "",
          last_name: userProfile.lastName || "",
          profile_image_url: userProfile.imageUrl || "",
        }
      })
      
      console.log("Successfully created user in database, now creating demo data...")
      
      // Create initial demo data in a transaction to ensure consistency
      await db.$transaction(async (tx) => {
        // Create some initial demo courses
        const courses = [
          {
            title: "Learn Python",
            description: "A comprehensive course covering Python basics to advanced concepts",
            color: "green",
            user_id: newUser.id
          },
          {
            title: "Advanced JavaScript",
            description: "Deep dive into modern JavaScript and advanced programming patterns",
            color: "yellow",
            user_id: newUser.id
          },
          {
            title: "Web Development Bootcamp",
            description: "Full-stack web development course covering frontend and backend technologies",
            color: "blue",
            user_id: newUser.id
          }
        ]
        
        // Create some initial demo projects
        const projects = [
          {
            title: "Personal Portfolio",
            description: "Building a responsive portfolio website using React and Tailwind CSS",
            color: "blue",
            user_id: newUser.id
          },
          {
            title: "E-commerce App",
            description: "Full-stack e-commerce application with Next.js and Supabase",
            color: "purple",
            user_id: newUser.id
          },
          {
            title: "Mobile Weather App",
            description: "React Native weather application with API integration",
            color: "teal",
            user_id: newUser.id
          }
        ]
        
        // Create all courses in a single batch
        await tx.course.createMany({
          data: courses,
          skipDuplicates: true
        })
        
        // Create all projects in a single batch
        await tx.project.createMany({
          data: projects,
          skipDuplicates: true
        })
      })
      
      console.log("User initialization complete with demo data")
      return newUser
    } catch (dbError: any) {
      console.error("Database error in initUser:", {
        error: dbError,
        userId: user_id,
        stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
      })
      
      // In production, don't crash the app but log the error
      if (process.env.NODE_ENV === 'production') {
        return null
      }
      throw dbError
    }
  } catch (error: any) {
    console.error("Error in initUser:", {
      error,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    
    // In production, don't crash the app but log the error
    if (process.env.NODE_ENV === 'production') {
      return null
    }
    throw error
  }
}
