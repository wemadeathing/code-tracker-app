import { ReactNode } from "react"
import DashboardSideBar from "./_components/dashboard-side-bar"
import DashboardTopNav from "./_components/dashbord-top-nav"
import { isAuthorized } from "@/utils/data/user/isAuthorized"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { initUser } from "@/lib/init-user"
import { TimerProvider } from "@/contexts/timer-context"
import { connectToDatabase } from "@/lib/db"
import Link from "next/link"

// Force dynamic rendering to avoid static generation issues with headers()
export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  try {
    // Ensure database connection with retries in development
    let connected = false
    const maxRetries = process.env.NODE_ENV === 'development' ? 3 : 1
    
    for (let i = 0; i < maxRetries && !connected; i++) {
      try {
        if (i > 0) {
          console.log(`Retrying database connection (attempt ${i + 1}/${maxRetries})...`)
          // Add a small delay between retries
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        connected = await connectToDatabase()
      } catch (dbError) {
        console.error(`Database connection error (attempt ${i + 1}/${maxRetries}):`, dbError)
        if (i === maxRetries - 1) {
          if (process.env.NODE_ENV !== 'production') {
            throw dbError
          }
          console.warn('Failed all database connection attempts, continuing in production')
        }
      }
    }
    
    // Get the current user and handle auth errors gracefully
    let user = null
    try {
      user = await currentUser()
      console.log('Clerk auth state:', user ? 'Authenticated' : 'Not authenticated')
    } catch (authError) {
      console.error('Failed to get current user:', authError)
      // Always redirect to sign-in for auth errors
      redirect("/sign-in")
    }
    
    // If no user, redirect to sign-in
    if (!user) {
      console.log('No user found, redirecting to sign-in')
      redirect("/sign-in")
    }
    
    console.log('User authenticated with Clerk ID:', user.id)
    
    // Initialize user - but prevent this from breaking the app completely
    let userInitialized = false
    try {
      console.log('Initializing user...')
      const result = await initUser()
      userInitialized = !!result // We initialized successfully if we got a result back
      console.log('User initialization result:', userInitialized ? 'success' : 'failed')
      
      // If we still failed to init the user but we're in production, 
      // log it but continue anyway
      if (!userInitialized && process.env.NODE_ENV === 'production') {
        console.warn('User initialization failed but continuing in production')
      } else if (!userInitialized) {
        // In development, this is a critical error that needs attention
        console.error('Failed to initialize user - fix this before proceeding')
        throw new Error('User initialization failed - cannot proceed without database user')
      }
    } catch (initError) {
      console.error('Error during user initialization:', initError)
      
      // For user initialization errors, we'll log but continue in production
      // But in development, we need to stop and fix this
      if (process.env.NODE_ENV !== 'production') {
        throw initError
      }
    }
    
    // Only check authorization if we successfully initialized the user
    // Otherwise, we'll skip this step in production
    if (userInitialized || process.env.NODE_ENV !== 'production') {
      try {
        const { authorized, message } = await isAuthorized(user.id)
        if (!authorized) {
          console.log('Authorization check failed:', message)
          // Handle unauthorized case more gracefully if needed
        }
      } catch (authError) {
        console.error('Authorization check error:', authError)
        // Continue without breaking the app - don't throw here
      }
    }
    
    return (
      <TimerProvider>
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
          <DashboardSideBar />
          <DashboardTopNav >
            <main className="flex flex-col gap-4 p-4 lg:gap-6">
              {children}
            </main>
          </DashboardTopNav>
        </div>
      </TimerProvider>
    )
  } catch (error) {
    console.error('Error in dashboard layout:', error)
    
    // For authentication errors, redirect to sign-in
    const errorMessage = String(error).toLowerCase()
    if (errorMessage.includes('authentication') || 
        errorMessage.includes('auth') || 
        errorMessage.includes('sign in') || 
        errorMessage.includes('log in')) {
      redirect("/sign-in")
    }
    
    // Return a fallback UI for other errors
    return (
      <div className="grid min-h-screen w-full place-items-center">
        <div className="text-center">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="mt-2">We're working on fixing this issue. Please try again later.</p>
          <Link href="/" className="mt-4 inline-block text-blue-500 underline">
            Return Home
          </Link>
        </div>
      </div>
    )
  }
}
