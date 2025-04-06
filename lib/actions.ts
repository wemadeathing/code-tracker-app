// Server actions for database operations
"use server"

import { db } from "./db"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { formatTimeFromSeconds } from "./utils"
import { Prisma } from "@prisma/client"
import { safeDatabaseOperation } from './db-utils'

// Helper function to get the user ID
const getUserId = async (): Promise<number> => {
  try {
    // Get user session
    const session = await auth()
    
    // This is important - in the latest Clerk versions, session might 
    // be an empty object rather than null when not authenticated
    const userId = session?.userId || null
    
    if (!userId) {
      console.error('User not authenticated - no userId in session:', session)
      throw new Error("You must be signed in to perform this action")
    }
    
    try {
      // Find the user in our database
      console.log('Looking up user in database with Clerk ID:', userId)
      const dbUser = await db.user.findUnique({
        where: { user_id: userId }
      })
      
      if (!dbUser) {
        console.error('User not found in database for Clerk ID:', userId)
        
        // Attempt to initialize user directly without requiring the module
        // This avoids potential circular dependency issues
        try {
          console.log('Attempting to initialize user directly...')
          
          // Call initUser function directly from its module
          const { initUser } = await import('./init-user')
          const initializedUser = await initUser()
          
          if (!initializedUser) {
            console.error('Failed to initialize user during getUserId')
            throw new Error("User not found in database and initialization failed")
          }
          
          return initializedUser.id
        } catch (initError) {
          console.error('Error initializing user:', initError)
          throw new Error("Failed to initialize user")
        }
      }
      
      console.log('User found in database, id:', dbUser.id)
      return dbUser.id
    } catch (error: any) {
      console.error('Database error in getUserId:', error)
      throw new Error(`Failed to fetch user data: ${error.message}`)
    }
  } catch (error: any) {
    console.error('Auth error in getUserId:', error)
    throw new Error(`Authentication failed: ${error.message}`)
  }
}

// Course operations
export async function getCourses() {
  try {
    const user_id = await getUserId()
    
    return await safeDatabaseOperation(
      async () => {
        const courses = await db.course.findMany({
          where: { user_id },
          orderBy: { created_time: 'desc' }
        })
        return courses
      },
      [] // Return empty array as fallback
    )
  } catch (error: any) {
    console.error('Error in getCourses:', error)
    // In production, return empty array rather than error
    if (process.env.NODE_ENV === 'production') {
      return []
    }
    throw error
  }
}

export async function addCourse({ title, description, color = "blue" }: { title: string, description?: string, color?: string }) {
  try {
    const user_id = await getUserId()
    
    const course = await db.course.create({
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
  } catch (error) {
    console.error("Error adding course:", error)
    if (process.env.NODE_ENV === 'production') {
      return null
    }
    throw error
  }
}

export async function updateCourse(id: number, { title, description, color }: { title?: string, description?: string, color?: string }) {
  try {
    const user_id = await getUserId()
    
    const course = await db.course.update({
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
  } catch (error) {
    console.error("Error updating course:", error)
    if (process.env.NODE_ENV === 'production') {
      return null
    }
    throw error
  }
}

export async function deleteCourse(id: number) {
  try {
    const user_id = await getUserId()
    
    await db.course.delete({
      where: { 
        id,
        user_id
      }
    })
    
    revalidatePath('/dashboard/courses')
    revalidatePath('/dashboard') // Also revalidate main dashboard
    return { success: true }
  } catch (error) {
    console.error("Error deleting course:", error)
    if (process.env.NODE_ENV === 'production') {
      return { success: false, error: "Failed to delete course" }
    }
    throw error
  }
}

// Project operations
export async function getProjects() {
  try {
    const user_id = await getUserId()
    
    return await safeDatabaseOperation(
      async () => {
        const projects = await db.project.findMany({
          where: { user_id },
          orderBy: { created_time: 'desc' }
        })
        return projects
      },
      [] // Return empty array as fallback
    )
  } catch (error: any) {
    console.error('Error in getProjects:', error)
    // In production, return empty array rather than error
    if (process.env.NODE_ENV === 'production') {
      return []
    }
    throw error
  }
}

export async function addProject({ title, description, color = "green" }: { title: string, description?: string, color?: string }) {
  try {
    const userId = await getUserId()
    
    const project = await db.project.create({
      data: {
        title,
        description,
        color,
        user_id: userId
      }
    })
    
    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard') // Also revalidate main dashboard
    return project
  } catch (error) {
    console.error("Error adding project:", error)
    if (process.env.NODE_ENV === 'production') {
      return null
    }
    throw error
  }
}

export async function updateProject(id: number, { title, description, color }: { title?: string, description?: string, color?: string }) {
  try {
    const userId = await getUserId()
    
    const project = await db.project.update({
      where: { 
        id,
        user_id: userId
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
  } catch (error) {
    console.error("Error updating project:", error)
    if (process.env.NODE_ENV === 'production') {
      return null
    }
    throw error
  }
}

export async function deleteProject(id: number) {
  try {
    const userId = await getUserId()
    
    await db.project.delete({
      where: { 
        id,
        user_id: userId
      }
    })
    
    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard') // Also revalidate main dashboard
    return { success: true }
  } catch (error) {
    console.error("Error deleting project:", error)
    if (process.env.NODE_ENV === 'production') {
      return { success: false, error: "Failed to delete project" }
    }
    throw error
  }
}

// Activity operations
export async function getActivities() {
  try {
    const user_id = await getUserId()
    
    return await safeDatabaseOperation(
      async () => {
        const activities = await db.activity.findMany({
          where: { user_id },
          orderBy: { created_time: 'desc' },
          include: {
            sessions: {
              orderBy: { start_time: 'desc' }
            }
          }
        })
        return activities
      },
      [] // Return empty array as fallback
    )
  } catch (error: any) {
    console.error('Error in getActivities:', error)
    // In production, return empty array rather than error
    if (process.env.NODE_ENV === 'production') {
      return []
    }
    throw error
  }
}

export async function addActivity({
  title,
  description,
  color,
  parentType,
  parentId
}: {
  title: string,
  description?: string,
  color?: string,
  parentType: 'course' | 'project',
  parentId: number
}) {
  try {
    console.log(`Creating activity: ${title} for ${parentType} ID: ${parentId}`)
    const user_id = await getUserId()
    
    // Verify parent exists and belongs to user
    if (parentType === 'course') {
      const course = await db.course.findFirst({
        where: {
          id: parentId,
          user_id
        }
      })
      
      if (!course) {
        console.error(`Course not found: ${parentId} for user: ${user_id}`)
        throw new Error("Course not found or does not belong to user")
      }
    } else if (parentType === 'project') {
      const project = await db.project.findFirst({
        where: {
          id: parentId,
          user_id
        }
      })
      
      if (!project) {
        console.error(`Project not found: ${parentId} for user: ${user_id}`)
        throw new Error("Project not found or does not belong to user")
      }
    }
    
    // Create the activity with the right parent
    const activityData: any = {
      title,
      description,
      color,
      user_id
    }
    
    // Add the right parent ID
    if (parentType === 'course') {
      activityData.course_id = parentId
    } else {
      activityData.project_id = parentId
    }
    
    const activity = await db.activity.create({
      data: activityData
    })
    
    console.log(`Activity created: ${activity.id}`)
    
    // Revalidate paths
    revalidatePath(`/dashboard/${parentType}s`)
    revalidatePath('/dashboard/activities')
    revalidatePath('/dashboard')
    
    return activity
  } catch (error) {
    console.error('Error adding activity:', error)
    throw error
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
  const existingActivity = await db.activity.findFirst({
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
  
  const activity = await db.activity.update({
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
  const activity = await db.activity.findFirst({
    where: {
      id,
      user_id
    }
  })
  
  if (!activity) {
    throw new Error("Activity not found or does not belong to user")
  }
  
  await db.activity.delete({
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
export async function addSession(activityId: number, sessionData: { duration: number, notes: string, date?: Date }) {
  try {
    const user_id = await getUserId()
    
    // Verify the activity belongs to the user
    const activity = await db.activity.findFirst({
      where: {
        id: activityId,
        user_id
      }
    })
    
    if (!activity) {
      console.error(`Activity not found: ${activityId} for user: ${user_id}`)
      throw new Error("Activity not found or does not belong to user")
    }
    
    // Create the session
    const startTime = sessionData.date || new Date()
    
    const session = await db.session.create({
      data: {
        start_time: startTime,
        duration: sessionData.duration,
        notes: sessionData.notes,
        activity_id: activityId,
        user_id
      }
    })
    
    console.log(`Session created for activity ${activityId}, duration: ${sessionData.duration}s`)
    
    // Also update streaks
    try {
      const today = new Date(startTime)
      today.setHours(0,0,0,0) // Start of day
      
      // Check if a streak already exists for this day
      const existingStreak = await db.streak.findFirst({
        where: {
          user_id,
          date: today
        }
      })
      
      // Only create a streak if it doesn't already exist
      if (!existingStreak) {
        await db.streak.create({
          data: {
            date: today,
            user_id
          }
        })
        console.log(`Streak created for ${today.toISOString().split('T')[0]}`)
      }
    } catch (streakError) {
      // Don't fail the whole operation if streak fails
      console.error('Error creating streak:', streakError)
    }
    
    revalidatePath('/dashboard/sessions')
    revalidatePath('/dashboard/activities')
    revalidatePath('/dashboard')
    
    return session
  } catch (error) {
    console.error('Error adding session:', error)
    throw error
  }
}

export async function deleteSession(id: number) {
  const user_id = await getUserId()
  
  // Verify the session belongs to the user
  const session = await db.session.findFirst({
    where: {
      id,
      user_id
    }
  })
  
  if (!session) {
    throw new Error("Session not found or does not belong to user")
  }
  
  await db.session.delete({
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
  
  const streaks = await db.streak.findMany({
    where: { user_id },
    orderBy: { date: 'desc' }
  })
  
  return streaks
}
