"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Define our types
export type CourseType = {
  id: number
  title: string
  description: string
  color: string
}

export type ProjectType = {
  id: number
  title: string
  description: string
  totalActivities: number
  totalTime: string
  color: string
}

export type ActivityType = {
  id: number
  title: string
  description: string
  parentType: 'course' | 'project'
  parentId: number
  parentTitle: string
  parentColor: string
  totalTime: string
  totalSeconds: number
  sessions: Array<{
    duration: number
    date: Date
    notes: string
  }>
}

type AppContextType = {
  // Courses state and methods
  courses: CourseType[]
  addCourse: (course: Omit<CourseType, 'id'>) => void
  updateCourse: (id: number, course: Partial<CourseType>) => void
  deleteCourse: (id: number) => void
  
  // Projects state and methods
  projects: ProjectType[]
  addProject: (project: Omit<ProjectType, 'id'>) => void
  updateProject: (id: number, project: Partial<ProjectType>) => void
  deleteProject: (id: number) => void
  
  // Activities state and methods
  activities: ActivityType[]
  addActivity: (activity: Omit<ActivityType, 'id'>) => void
  updateActivity: (id: number, activity: Partial<ActivityType>) => void
  deleteActivity: (id: number) => void
  
  // Timer functionality
  startActivityTimer: (activityId: number) => void
  addTimeToActivity: (activityId: number, seconds: number, notes: string) => void
  deleteSessionFromActivity: (activityId: number, sessionIndex: number) => void
  
  // Utilities
  formatTimeFromSeconds: (seconds: number) => string
}

// Storage keys
const STORAGE_KEYS = {
  COURSES: 'courseApp_courses',
  PROJECTS: 'courseApp_projects',
  ACTIVITIES: 'courseApp_activities'
}

// Default context value
const defaultContextValue: AppContextType = {
  courses: [],
  addCourse: () => {},
  updateCourse: () => {},
  deleteCourse: () => {},
  
  projects: [],
  addProject: () => {},
  updateProject: () => {},
  deleteProject: () => {},
  
  activities: [],
  addActivity: () => {},
  updateActivity: () => {},
  deleteActivity: () => {},
  
  startActivityTimer: () => {},
  addTimeToActivity: () => {},
  deleteSessionFromActivity: () => {},
  
  formatTimeFromSeconds: () => '0h 0m'
}

// Create the context
const AppContext = createContext<AppContextType>(defaultContextValue)

// Helper to format time
const formatTimeFromSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

// Hook to use the context
export const useAppContext = () => useContext(AppContext)

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  // State for courses
  const [courses, setCourses] = useState<CourseType[]>([
    {
      id: 1,
      title: 'Learn Python',
      description: 'A comprehensive course covering Python basics to advanced concepts',
      color: 'green'
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      description: 'Deep dive into modern JavaScript and advanced programming patterns',
      color: 'yellow'
    },
    {
      id: 3,
      title: 'Web Development Bootcamp',
      description: 'Full-stack web development course covering frontend and backend technologies',
      color: 'blue'
    }
  ])
  
  // State for projects
  const [projects, setProjects] = useState<ProjectType[]>([
    {
      id: 1,
      title: 'Personal Portfolio',
      description: 'Building a responsive portfolio website using React and Tailwind CSS',
      totalActivities: 4,
      totalTime: '18h 45m',
      color: 'blue'
    },
    {
      id: 2,
      title: 'E-commerce App',
      description: 'Full-stack e-commerce application with Next.js and Supabase',
      totalActivities: 6,
      totalTime: '32h 20m',
      color: 'purple'
    },
    {
      id: 3,
      title: 'Mobile Weather App',
      description: 'React Native weather application with API integration',
      totalActivities: 3,
      totalTime: '8h 15m',
      color: 'teal'
    }
  ])
  
  // State for activities
  const [activities, setActivities] = useState<ActivityType[]>([
    {
      id: 1,
      title: 'Data Structures',
      description: 'Learn about arrays, linked lists, trees and graphs',
      parentType: 'course',
      parentId: 1,
      parentTitle: 'Learn Python',
      parentColor: 'green',
      totalTime: '8h 15m',
      totalSeconds: 29700,
      sessions: [
        { duration: 29700, date: new Date('2025-03-15'), notes: 'Completed arrays and linked lists' }
      ]
    },
    {
      id: 2,
      title: 'Algorithms',
      description: 'Sorting, searching and other common algorithms',
      parentType: 'course',
      parentId: 1,
      parentTitle: 'Learn Python',
      parentColor: 'green',
      totalTime: '6h 30m',
      totalSeconds: 23400,
      sessions: [
        { duration: 23400, date: new Date('2025-03-14'), notes: 'Worked on bubble sort and quick sort' }
      ]
    },
    {
      id: 3,
      title: 'Promises & Async/Await',
      description: 'Deep dive into JavaScript asynchronous patterns',
      parentType: 'course',
      parentId: 2,
      parentTitle: 'Advanced JavaScript',
      parentColor: 'yellow',
      totalTime: '4h 45m',
      totalSeconds: 17100,
      sessions: [
        { duration: 17100, date: new Date('2025-03-13'), notes: 'Learned about promise chaining' }
      ]
    },
    {
      id: 4,
      title: 'API Integration',
      description: 'Connecting to weather APIs and parsing responses',
      parentType: 'project',
      parentId: 3,
      parentTitle: 'Mobile Weather App',
      parentColor: 'teal',
      totalTime: '3h 20m',
      totalSeconds: 12000,
      sessions: [
        { duration: 12000, date: new Date('2025-03-12'), notes: 'Set up API key and tested endpoints' }
      ]
    },
    {
      id: 5,
      title: 'UI Components',
      description: 'Building reusable UI components for the app',
      parentType: 'project',
      parentId: 2,
      parentTitle: 'E-commerce App',
      parentColor: 'purple',
      totalTime: '10h 45m',
      totalSeconds: 38700,
      sessions: [
        { duration: 38700, date: new Date('2025-03-11'), notes: 'Created product card and list components' }
      ]
    }
  ])

  // Load data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedCourses = localStorage.getItem(STORAGE_KEYS.COURSES)
        const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS)
        const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES)
        
        if (storedCourses) {
          setCourses(JSON.parse(storedCourses))
        }
        
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects))
        }
        
        if (storedActivities) {
          // Need to convert string dates back to Date objects
          const parsedActivities = JSON.parse(storedActivities)
          const processedActivities = parsedActivities.map((activity: any) => ({
            ...activity,
            sessions: activity.sessions.map((session: any) => ({
              ...session,
              date: new Date(session.date)
            }))
          }))
          setActivities(processedActivities)
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error)
      }
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses))
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities))
    }
  }, [courses, projects, activities])

  // Update project stats based on activities
  useEffect(() => {
    const updatedProjects = projects.map(project => {
      // Filter activities for this project
      const projectActivities = activities.filter(
        activity => activity.parentType === 'project' && activity.parentId === project.id
      )
      
      // Calculate total time in seconds
      const totalSeconds = projectActivities.reduce(
        (total, activity) => total + activity.totalSeconds, 0
      )
      
      return {
        ...project,
        totalActivities: projectActivities.length,
        totalTime: formatTimeFromSeconds(totalSeconds)
      }
    })
    
    if (JSON.stringify(updatedProjects) !== JSON.stringify(projects)) {
      setProjects(updatedProjects)
    }
  }, [activities, projects])

  // CRUD operations for Courses
  const addCourse = (course: Omit<CourseType, 'id'>) => {
    const newCourse = {
      ...course,
      id: courses.length ? Math.max(...courses.map(c => c.id)) + 1 : 1
    }
    setCourses([...courses, newCourse])
  }

  const updateCourse = (id: number, courseUpdate: Partial<CourseType>) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, ...courseUpdate } : course
    ))
    
    // Update any related activities if the course title or color changed
    if (courseUpdate.title || courseUpdate.color) {
      setActivities(activities.map(activity => {
        if (activity.parentType === 'course' && activity.parentId === id) {
          return {
            ...activity,
            parentTitle: courseUpdate.title || activity.parentTitle,
            parentColor: courseUpdate.color || activity.parentColor
          }
        }
        return activity
      }))
    }
  }

  const deleteCourse = (id: number) => {
    setCourses(courses.filter(course => course.id !== id))
    
    // Optional: delete all activities related to this course
    setActivities(activities.filter(
      activity => !(activity.parentType === 'course' && activity.parentId === id)
    ))
  }

  // CRUD operations for Projects
  const addProject = (project: Omit<ProjectType, 'id'>) => {
    const newProject = {
      ...project,
      id: projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1,
      totalActivities: 0,
      totalTime: '0h 0m'
    }
    setProjects([...projects, newProject])
  }

  const updateProject = (id: number, projectUpdate: Partial<ProjectType>) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, ...projectUpdate } : project
    ))
    
    // Update any related activities if the project title or color changed
    if (projectUpdate.title || projectUpdate.color) {
      setActivities(activities.map(activity => {
        if (activity.parentType === 'project' && activity.parentId === id) {
          return {
            ...activity,
            parentTitle: projectUpdate.title || activity.parentTitle,
            parentColor: projectUpdate.color || activity.parentColor
          }
        }
        return activity
      }))
    }
  }

  const deleteProject = (id: number) => {
    setProjects(projects.filter(project => project.id !== id))
    
    // Optional: delete all activities related to this project
    setActivities(activities.filter(
      activity => !(activity.parentType === 'project' && activity.parentId === id)
    ))
  }

  // CRUD operations for Activities
  const addActivity = (activity: Omit<ActivityType, 'id'>) => {
    const newActivity = {
      ...activity,
      id: activities.length ? Math.max(...activities.map(a => a.id)) + 1 : 1
    }
    setActivities([...activities, newActivity])
  }

  const updateActivity = (id: number, activityUpdate: Partial<ActivityType>) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, ...activityUpdate } : activity
    ))
  }

  const deleteActivity = (id: number) => {
    setActivities(activities.filter(activity => activity.id !== id))
  }

  // Timer functionality
  const startActivityTimer = (activityId: number) => {
    // This function is a placeholder - the actual timer implementation
    // happens in the TimerDialog component
    console.log(`Starting timer for activity ${activityId}`)
  }

  const addTimeToActivity = (activityId: number, seconds: number, notes: string) => {
    setActivities(activities.map(activity => {
      if (activity.id === activityId) {
        const newSession = {
          duration: seconds,
          date: new Date(),
          notes
        }
        
        const newTotalSeconds = activity.totalSeconds + seconds
        
        return {
          ...activity,
          totalSeconds: newTotalSeconds,
          totalTime: formatTimeFromSeconds(newTotalSeconds),
          sessions: [...activity.sessions, newSession]
        }
      }
      return activity
    }))
  }

  const deleteSessionFromActivity = (activityId: number, sessionIndex: number) => {
    setActivities(activities.map(activity => {
      if (activity.id === activityId) {
        // Get the session to be deleted
        const sessionToDelete = activity.sessions[sessionIndex]
        
        if (!sessionToDelete) return activity
        
        // Remove the session's duration from the total
        const newTotalSeconds = Math.max(0, activity.totalSeconds - sessionToDelete.duration)
        
        // Create a new sessions array without the deleted session
        const newSessions = activity.sessions.filter((_, index) => index !== sessionIndex)
        
        // Return the updated activity
        return {
          ...activity,
          totalSeconds: newTotalSeconds,
          totalTime: formatTimeFromSeconds(newTotalSeconds),
          sessions: newSessions
        }
      }
      return activity
    }))
  }

  const contextValue: AppContextType = {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    
    projects,
    addProject,
    updateProject,
    deleteProject,
    
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    
    startActivityTimer,
    addTimeToActivity,
    deleteSessionFromActivity,
    
    formatTimeFromSeconds
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
