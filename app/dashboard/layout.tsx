import { ReactNode } from "react"
import DashboardSideBar from "./_components/dashboard-side-bar"
import DashboardTopNav from "./_components/dashbord-top-nav"
import { isAuthorized } from "@/utils/data/user/isAuthorized"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
// import { initUser } from "@/lib/init-user" // Keep import commented out
import { TimerProvider } from "@/contexts/timer-context"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser()
  
  if (!user) {
    redirect("/sign-in")
    return null
  }
  
  // await initUser() // Keep this call removed/commented out
  
  const { authorized, message } = await isAuthorized(user.id)
  if (!authorized) {
    console.log('authorized check fired')
    // Depending on requirements, might redirect or show a message here
    // For now, just logging
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
}
