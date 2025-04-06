import { ReactNode } from "react"
import DashboardSideBar from "./_components/dashboard-side-bar"
import DashboardTopNav from "./_components/dashbord-top-nav"
import { isAuthorized } from "@/utils/data/user/isAuthorized"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { initUser } from "@/lib/init-user"
import { TimerProvider } from "@/contexts/timer-context"
import { connectToDatabase } from "@/lib/db"

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
    
    const { authorized, message } = await isAuthorized(user.id)
    if (!authorized) {
      console.log('authorized check fired')
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
    throw error // This will trigger Next.js error boundary
  }
}
