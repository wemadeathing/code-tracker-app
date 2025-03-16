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
  
  // Create the user in our database
  const newUser = await typedDb.user.create({
    data: {
      user_id,
      email: "", // You'll need to get this from Clerk's user profile API
      first_name: "",
      last_name: "",
      profile_image_url: "",
    }
  })
  
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
  
  // Create courses one by one
  for (const courseData of courses) {
    await typedDb.course.create({ data: courseData });
  }
  
  // Create projects one by one
  for (const projectData of projects) {
    await typedDb.project.create({ data: projectData });
  }
  
  return newUser
}
