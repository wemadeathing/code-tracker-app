// Server actions for database operations
"use server"

import { db } from "./db"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { formatTimeFromSeconds } from "./utils"
import { PrismaClient, Prisma } from "@prisma/client"

// Use the properly typed Prisma client
const typedDb = db as PrismaClient

// Helper function to get the user ID
const getUserId = async () => {
  const session = await auth()
  const userId = session.userId // Clerk uses camelCase (userId)
  
  if (!userId) {
    throw new Error("You must be signed in to perform this action")
  }
  
  // Get the database user ID from the Clerk user ID
  const dbUser = await typedDb.user.findUnique({
    where: { user_id: userId } // Prisma schema uses snake_case (user_id)
  })
  
  if (!dbUser) {
    throw new Error("User not found in database")
  }
  
  return dbUser.id
}

// Course operations
export async function getCourses() {
  const user_id = await getUserId()
  
  const courses = await typedDb.course.findMany({
    where: { user_id },
    orderBy: { created_time: 'desc' }
  })
  
  return courses
}

export async function addCourse({ title, description, color = "blue" }: { title: string, description?: string, color?: string }) {
  const user_id = await getUserId()
  
  const course = await typedDb.course.create({
    data: {
      title,
      description,
      color,
      user_id
    }
  })
  
  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard') // Also revalidate main dashboard
  return course
}

export async function updateCourse(id: number, { title, description, color }: { title?: string, description?: string, color?: string }) {
  const user_id = await getUserId()
  
  const course = await typedDb.course.update({
    where: { 
      id,
      user_id
    },
    data: {
      title,
      description,
      color
    }
  })
  
  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard') // Also revalidate main dashboard
  return course
}

export async function deleteCourse(id: number) {
  const user_id = await getUserId()
  
  await typedDb.course.delete({
    where: { 
      id,
      user_id
    }
  })
  
  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard') // Also revalidate main dashboard
  return { success: true }
}

// Project operations
export async function getProjects() {
  const user_id = await getUserId()
  
  const projects = await typedDb.project.findMany({
    where: { user_id },
    orderBy: { created_time: 'desc' },
    include: {
      activities: {
        include: {
          sessions: true
        }
      }
    }
  })
  
  // Calculate stats for each project
  return projects.map((project: any) => {
    const total_time = project.activities.reduce((acc: number, activity: any) => {
      const activity_time = activity.sessions.reduce((total: number, session: any) => {
        return total + session.duration
      }, 0)
      return acc + activity_time
    }, 0)
    
    return {
      ...project,
      total_activities: project.activities.length,
      total_time: formatTimeFromSeconds(total_time)
    }
  })
}

export async function addProject({ title, description, color = "green" }: { title: string, description?: string, color?: string }) {
  const user_id = await getUserId()
  
  const project = await typedDb.project.create({
    data: {
      title,
      description,
      color,
      user_id
    }
  })
  
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard') // Also revalidate main dashboard
  return project
}

export async function updateProject(id: number, { title, description, color }: { title?: string, description?: string, color?: string }) {
  const user_id = await getUserId()
  
  const project = await typedDb.project.update({
    where: { 
      id,
      user_id
    },
    data: {
      title,
      description,
      color
    }
  })
  
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard') // Also revalidate main dashboard
  return project
}

export async function deleteProject(id: number) {
  const user_id = await getUserId()
  
  await typedDb.project.delete({
    where: { 
      id,
      user_id
    }
  })
  
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard') // Also revalidate main dashboard
  return { success: true }
}

// Activity operations
export async function getActivities() {
  const user_id = await getUserId()
  
  const activities = await typedDb.activity.findMany({
    where: { user_id },
    orderBy: { created_time: 'desc' },
    include: {
      course: true,
      project: true,
      sessions: {
        orderBy: { created_time: 'desc' }
      }
    }
  })
  
  return activities.map((activity: any) => {
    const total_seconds = activity.sessions.reduce((total: number, session: any) => {
      return total + session.duration
    }, 0)
    
    const parent = activity.course || activity.project
    // Ensure the parentType is correctly typed as 'course' | 'project'
    const parentType = activity.course ? 'course' as const : 'project' as const
    
    // Get the parent's color directly from the parent object
    const parentColor = parent?.color || "purple" // Only use purple as fallback if no parent color exists
    
    return {
      id: activity.id,
      title: activity.title,
      description: activity.description || "",
      parentType,
      parentId: parent?.id || 0,
      parentTitle: parent?.title || "",
      parentColor,
      color: activity.color || parentColor, // Use activity's own color if available, otherwise use parent's color
      totalTime: formatTimeFromSeconds(total_seconds),
      totalSeconds: total_seconds,
      sessions: activity.sessions.map((session: any) => ({
        id: session.id,
        duration: session.duration,
        date: session.start_time,
        notes: session.notes || ""
      }))
    }
  })
}

export async function addActivity({ 
  title, 
  description, 
  parentType, 
  parentId,
  color = "purple"
}: { 
  title: string, 
  description?: string, 
  parentType: 'course' | 'project', 
  parentId: number,
  color?: string 
}) {
  const user_id = await getUserId()
  
  // Create data object with common fields
  const data: any = {
    title,
    description: description || null, // Ensure null is used for empty descriptions
    color,
    user_id
  }
  
  // Add parent reference based on type
  if (parentType === 'course') {
    data.course_id = parentId
  } else if (parentType === 'project') {
    data.project_id = parentId
  }
  
  const activity = await typedDb.activity.create({
    data
  })
  
  revalidatePath('/dashboard/activities')
  revalidatePath(`/dashboard/${parentType}s`)
  revalidatePath('/dashboard') // Also revalidate main dashboard
  
  // Convert to camelCase fields for frontend
  return {
    ...activity,
    parentType,
    parentId
  }
}

export async function updateActivity(
  id: number, 
  { 
    title, 
    description, 
    color 
  }: { 
    title?: string, 
    description?: string, 
    color?: string 
  }
) {
  const user_id = await getUserId()
  
  // Get the activity to determine its parent type
  const existingActivity = await typedDb.activity.findFirst({
    where: {
      id,
      user_id
    },
    include: {
      course: true,
      project: true
    }
  })
  
  if (!existingActivity) {
    throw new Error("Activity not found or does not belong to user")
  }
  
  const activity = await typedDb.activity.update({
    where: { 
      id,
      user_id
    },
    data: {
      title,
      description,
      color
    },
    include: {
      course: true,
      project: true
    }
  })
  
  const parentType = activity.course_id ? 'course' : 'project'
  revalidatePath('/dashboard/activities')
  revalidatePath(`/dashboard/${parentType}s`)
  revalidatePath('/dashboard') // Also revalidate main dashboard
  return activity
}

export async function deleteActivity(id: number) {
  const user_id = await getUserId()
  
  // Get the activity to determine its parent type
  const activity = await typedDb.activity.findFirst({
    where: {
      id,
      user_id
    }
  })
  
  if (!activity) {
    throw new Error("Activity not found or does not belong to user")
  }
  
  await typedDb.activity.delete({
    where: { 
      id,
      user_id
    }
  })
  
  const parentType = activity.course_id ? 'course' : 'project'
  revalidatePath('/dashboard/activities')
  revalidatePath(`/dashboard/${parentType}s`)
  revalidatePath('/dashboard') // Also revalidate main dashboard
  return { success: true }
}

// Session operations
export async function addSession(
  activity_id: number, 
  { duration, notes, date }: { duration: number, notes?: string, date?: Date }
) {
  const user_id = await getUserId()
  
  // Verify the activity belongs to the user
  const activity = await typedDb.activity.findFirst({
    where: {
      id: activity_id,
      user_id
    }
  })
  
  if (!activity) {
    throw new Error("Activity not found or does not belong to user")
  }
  
  const session = await typedDb.session.create({
    data: {
      start_time: date || new Date(),
      duration,
      notes,
      activity_id,
      user_id
    }
  })
  
  // Update streak data - create or update for the session date
  const sessionDate = date || new Date()
  const streakDate = new Date(sessionDate)
  streakDate.setHours(0, 0, 0, 0)
  
  await typedDb.streak.upsert({
    where: {
      user_id_date: {
        user_id,
        date: streakDate
      }
    },
    update: {},
    create: {
      date: streakDate,
      user_id
    }
  })
  
  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard/timer')
  revalidatePath('/dashboard') // Also revalidate main dashboard
  return session
}

export async function deleteSession(id: number) {
  const user_id = await getUserId()
  
  // Verify the session belongs to the user
  const session = await typedDb.session.findFirst({
    where: {
      id,
      user_id
    }
  })
  
  if (!session) {
    throw new Error("Session not found or does not belong to user")
  }
  
  await typedDb.session.delete({
    where: { id }
  })
  
  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard/timer')
  revalidatePath('/dashboard') // Also revalidate main dashboard
  return { success: true }
}

// Streak operations
export async function getStreaks() {
  const user_id = await getUserId()
  
  const streaks = await typedDb.streak.findMany({
    where: { user_id },
    orderBy: { date: 'desc' }
  })
  
  return streaks
}
