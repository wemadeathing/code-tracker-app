"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  getCourses, 
  addCourse as addCourseAction, 
  updateCourse as updateCourseAction, 
  deleteCourse as deleteCourseAction,
  getProjects,
  addProject as addProjectAction,
  updateProject as updateProjectAction,
  deleteProject as deleteProjectAction,
  getActivities,
  addActivity as addActivityAction,
  updateActivity as updateActivityAction,
  deleteActivity as deleteActivityAction,
  addSession as addSessionAction,
  deleteSession as deleteSessionAction
} from '@/lib/actions'

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
  totalActivities?: number
  totalTime?: string
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
  color?: string
  totalTime?: string
  totalSeconds?: number
  sessions?: Array<{
    id?: number
    duration: number
    date: Date
    notes: string
  }>
}

type AppContextType = {
  // Courses state and methods
  courses: CourseType[]
  addCourse: (course: Omit<CourseType, 'id'>) => Promise<void>
  updateCourse: (id: number, course: Partial<CourseType>) => Promise<void>
  deleteCourse: (id: number) => Promise<void>
  
  // Projects state and methods
  projects: ProjectType[]
  addProject: (project: Omit<ProjectType, 'id'>) => Promise<void>
  updateProject: (id: number, project: Partial<ProjectType>) => Promise<void>
  deleteProject: (id: number) => Promise<void>
  
  // Activities state and methods
  activities: ActivityType[]
  addActivity: (activity: Omit<ActivityType, 'id'>) => Promise<void>
  updateActivity: (id: number, activity: Partial<ActivityType>) => Promise<void>
  deleteActivity: (id: number) => Promise<void>
  
  // Timer functionality
  startActivityTimer: (activityId: number) => void
  addTimeToActivity: (activityId: number, seconds: number, notes: string) => Promise<void>
  deleteSessionFromActivity: (activityId: number, sessionIndex: number) => Promise<void>
  
  // Utility methods
  formatTimeFromSeconds: (seconds: number) => string
}

// Default context value
const defaultContextValue: AppContextType = {
  courses: [],
  addCourse: async () => {},
  updateCourse: async () => {},
  deleteCourse: async () => {},
  
  projects: [],
  addProject: async () => {},
  updateProject: async () => {},
  deleteProject: async () => {},
  
  activities: [],
  addActivity: async () => {},
  updateActivity: async () => {},
  deleteActivity: async () => {},
  
  startActivityTimer: () => {},
  addTimeToActivity: async () => {},
  deleteSessionFromActivity: async () => {},
  
  formatTimeFromSeconds: () => '',
}

// Create the context
const AppContext = createContext<AppContextType>(defaultContextValue)

// Helper to format time
function formatTimeFromSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

// Hook to use the context
export const useAppContext = () => useContext(AppContext)

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  // State for data
  const [courses, setCourses] = useState<CourseType[]>([])
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Activity timer state
  const [activeActivityId, setActiveActivityId] = useState<number | null>(null)
  const [timerStart, setTimerStart] = useState<Date | null>(null)

  // Load data from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch courses from the database
        const coursesData = await getCourses()
        if (coursesData) {
          setCourses(coursesData)
        }
        
        // Fetch projects from the database
        const projectsData = await getProjects()
        if (projectsData) {
          setProjects(projectsData)
        }
        
        // Fetch activities from the database
        const activitiesData = await getActivities()
        if (activitiesData) {
          setActivities(activitiesData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Course CRUD operations
  const addCourse = async (course: Omit<CourseType, 'id'>) => {
    try {
      const newCourse = await addCourseAction({
        title: course.title, 
        description: course.description, 
        color: course.color
      })
      if (newCourse) {
        setCourses(prevCourses => [...prevCourses, newCourse as CourseType])
      }
    } catch (error) {
      console.error('Error adding course:', error)
    }
  }

  const updateCourse = async (id: number, course: Partial<CourseType>) => {
    try {
      const updatedCourse = await updateCourseAction(id, {
        title: course.title,
        description: course.description,
        color: course.color
      })
      if (updatedCourse) {
        setCourses(prevCourses => 
          prevCourses.map(c => c.id === id ? { ...c, ...course } : c)
        )
      }
    } catch (error) {
      console.error('Error updating course:', error)
    }
  }

  const deleteCourse = async (id: number) => {
    try {
      await deleteCourseAction(id)
      setCourses(prevCourses => prevCourses.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  // Project CRUD operations
  const addProject = async (project: Omit<ProjectType, 'id'>) => {
    try {
      const newProject = await addProjectAction({
        title: project.title, 
        description: project.description, 
        color: project.color
      })
      if (newProject) {
        setProjects(prevProjects => [...prevProjects, newProject as ProjectType])
      }
    } catch (error) {
      console.error('Error adding project:', error)
    }
  }

  const updateProject = async (id: number, project: Partial<ProjectType>) => {
    try {
      const updatedProject = await updateProjectAction(id, {
        title: project.title,
        description: project.description,
        color: project.color
      })
      if (updatedProject) {
        setProjects(prevProjects => 
          prevProjects.map(p => p.id === id ? { ...p, ...project } : p)
        )
      }
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const deleteProject = async (id: number) => {
    try {
      await deleteProjectAction(id)
      setProjects(prevProjects => prevProjects.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  // Activity CRUD operations
  const addActivity = async (activity: Omit<ActivityType, 'id'>) => {
    try {
      // Convert from camelCase to snake_case for the API
      const newActivity = await addActivityAction({ 
        title: activity.title, 
        description: activity.description,
        // Convert camelCase to snake_case for the backend
        parent_type: activity.parentType === 'course' ? 'course' : 'project',
        parent_id: activity.parentId
      })
      
      if (newActivity) {
        const parent = activity.parentType === 'course' 
          ? courses.find(c => c.id === activity.parentId)
          : projects.find(p => p.id === activity.parentId)
        
        // Convert from backend response to our frontend type
        const activityWithParent = {
          ...newActivity,
          // Add these frontend-specific fields 
          parentType: activity.parentType,
          parentId: activity.parentId,
          parentTitle: parent?.title || '',
          parentColor: parent?.color || 'blue',
          totalSeconds: 0,
          totalTime: '0h 0m',
          sessions: []
        }
        
        setActivities(prevActivities => [...prevActivities, activityWithParent as ActivityType])
      }
    } catch (error) {
      console.error('Error adding activity:', error)
    }
  }

  const updateActivity = async (id: number, activity: Partial<ActivityType>) => {
    try {
      const { parentTitle, parentColor, totalTime, totalSeconds, sessions, ...rest } = activity
      
      // Convert from camelCase to snake_case for the API
      const dbActivity = {
        title: rest.title,
        description: rest.description
      }
      
      const updatedActivity = await updateActivityAction(id, dbActivity)
      
      if (updatedActivity) {
        setActivities(prevActivities => 
          prevActivities.map(a => a.id === id ? { ...a, ...activity } : a)
        )
      }
    } catch (error) {
      console.error('Error updating activity:', error)
    }
  }

  const deleteActivity = async (id: number) => {
    try {
      await deleteActivityAction(id)
      setActivities(prevActivities => prevActivities.filter(a => a.id !== id))
    } catch (error) {
      console.error('Error deleting activity:', error)
    }
  }

  // Timer functionality
  const startActivityTimer = (activityId: number) => {
    setActiveActivityId(activityId)
    setTimerStart(new Date())
  }

  const addTimeToActivity = async (activityId: number, seconds: number, notes: string) => {
    try {
      // Reset timer state
      setActiveActivityId(null)
      setTimerStart(null)
      
      // Add session to database
      const session = await addSessionAction(
        activityId, 
        { 
          duration: seconds, 
          notes 
        }
      )
      
      if (session) {
        setActivities(prevActivities => 
          prevActivities.map(activity => {
            if (activity.id === activityId) {
              const currentSessions = activity.sessions || []
              const totalSeconds = (activity.totalSeconds || 0) + seconds
              
              return {
                ...activity,
                totalSeconds,
                totalTime: formatTimeFromSeconds(totalSeconds),
                sessions: [
                  ...currentSessions,
                  {
                    id: session.id,
                    duration: seconds,
                    date: new Date(),
                    notes
                  }
                ]
              }
            }
            return activity
          })
        )
      }
    } catch (error) {
      console.error('Error adding time to activity:', error)
    }
  }

  const deleteSessionFromActivity = async (activityId: number, sessionIndex: number) => {
    try {
      const activity = activities.find(a => a.id === activityId)
      if (!activity || !activity.sessions || !activity.sessions[sessionIndex]) {
        return
      }
      
      const sessionId = activity.sessions[sessionIndex].id
      if (!sessionId) return
      
      await deleteSessionAction(sessionId)
      
      setActivities(prevActivities => 
        prevActivities.map(activity => {
          if (activity.id === activityId && activity.sessions) {
            const updatedSessions = [...activity.sessions]
            const removedSession = updatedSessions.splice(sessionIndex, 1)[0]
            const totalSeconds = (activity.totalSeconds || 0) - removedSession.duration
            
            return {
              ...activity,
              totalSeconds,
              totalTime: formatTimeFromSeconds(totalSeconds),
              sessions: updatedSessions
            }
          }
          return activity
        })
      )
    } catch (error) {
      console.error('Error deleting session:', error)
    }
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
