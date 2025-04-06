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

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  try {
    // Ensure database connection
    await connectToDatabase()
    
    const user = await currentUser()
    
    if (!user) {
      redirect("/sign-in")
      return null
    }
    
    await initUser()
    
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
    
    // Return a fallback UI instead of throwing
    return (
      <div className="grid min-h-screen w-full place-items-center">
        <div className="text-center">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p>We're working on fixing this issue. Please try again later.</p>
          <Link href="/" className="mt-4 inline-block text-blue-500 underline">
            Return Home
          </Link>
        </div>
      </div>
    )
  }
}
