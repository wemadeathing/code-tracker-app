// Server actions for database operations
"use server"

import { db } from "./db"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { formatTimeFromSeconds } from "./utils"
import { PrismaClient, Prisma } from "@prisma/client"

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
    const parent_type = activity.course ? 'course' : 'project'
    
    // Ensure we always have a color, even if parent is missing
    let parent_color = "purple"; // Default color
    
    // For course parents
    if (activity.course && activity.course.color) {
      parent_color = activity.course.color;
    }
    // For project parents
    else if (activity.project && activity.project.color) {
      parent_color = activity.project.color;
    }
    
    return {
      id: activity.id,
      title: activity.title,
      description: activity.description || "",
      parent_type,
      parent_id: parent?.id || 0,
      parent_title: parent?.title || "",
      parent_color: parent_color,
      color: activity.color || parent_color, // Use activity's own color if available, otherwise fallback to parent's color
      total_time: formatTimeFromSeconds(total_seconds),
      total_seconds,
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
  parent_type, 
  parent_id 
}: { 
  title: string, 
  description?: string, 
  parent_type: 'course' | 'project', 
  parent_id: number 
}) {
  const user_id = await getUserId()
  
  // First, fetch the parent to get its color
  let parentColor = "purple"; // Default color
  
  if (parent_type === 'course') {
    const course = await typedDb.course.findUnique({
      where: { id: parent_id }
    });
    if (course) {
      parentColor = course.color;
    }
  } else {
    const project = await typedDb.project.findUnique({
      where: { id: parent_id }
    });
    if (project) {
      parentColor = project.color;
    }
  }
  
  const data: {
    title: string;
    description?: string;
    user_id: number;
    course_id?: number;
    project_id?: number;
  } = {
    title,
    description,
    user_id
  }
  
  if (parent_type === 'course') {
    data.course_id = parent_id
  } else {
    data.project_id = parent_id
  }
  
  // Create activity
  const activity = await typedDb.activity.create({ data })
  
  // Now update the activity color with a raw query since Prisma doesn't recognize the color field yet
  await db.$executeRaw`UPDATE activity SET color = ${parentColor} WHERE id = ${activity.id}`;
  
  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard/timer')
  return activity
}

export async function updateActivity(
  id: number, 
  { title, description }: { title?: string, description?: string }
) {
  const user_id = await getUserId()
  
  const activity = await typedDb.activity.update({
    where: { 
      id,
      user_id
    },
    data: {
      title,
      description
    }
  })
  
  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard/timer')
  return activity
}

export async function deleteActivity(id: number) {
  const user_id = await getUserId()
  
  await typedDb.activity.delete({
    where: { 
      id,
      user_id
    }
  })
  
  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard/timer')
  return { success: true }
}

// Session operations
export async function addSession(
  activity_id: number, 
  { duration, notes }: { duration: number, notes?: string }
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
      start_time: new Date(),
      duration,
      notes,
      activity_id,
      user_id
    }
  })
  
  // Update streak data - create or update today's streak
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  await typedDb.streak.upsert({
    where: {
      user_id_date: {
        user_id,
        date: today
      }
    },
    update: {},
    create: {
      date: today,
      user_id
    }
  })
  
  revalidatePath('/dashboard/courses')
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard/timer')
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
