"use client"

import { Separator } from '@/components/ui/separator'
import clsx from 'clsx'
import {
  Banknote,
  Folder,
  HomeIcon,
  Settings,
  Code,
  Clock,
  Timer,
  BookOpen,
  GraduationCap,
  LayoutList,
  Square,
  StopCircle
} from "lucide-react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaTasks } from 'react-icons/fa'
import { useTimer } from '@/contexts/timer-context'
import { Badge } from '@/components/ui/badge'
import { useAppContext } from '@/contexts/app-context'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Helper function to format seconds to HH:MM:SS or MM:SS
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  return [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(secs).padStart(2, '0')
  ]
    .filter(Boolean)
    .join(':')
}

export default function DashboardSideBar() {
  const pathname = usePathname();
  const { isRunning, seconds, activeActivityId, stopTimer, resetTimer } = useTimer();
  const { activities } = useAppContext();

  // Get the current activity name if timer is running
  const currentActivity = activities.find(a => a.id === activeActivityId);

  // Handle stopping the timer
  const handleStopTimer = () => {
    stopTimer();
  };

  return (
    <div className="lg:block hidden border-r h-full">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[55px] items-center justify-between border-b px-3 w-full">
          <Link className="flex items-center gap-2 font-semibold ml-1" href="/">
            <span className="">CodeTracker</span>
          </Link>
          {isRunning && currentActivity && (
            <div className="flex items-center gap-2">
              <div className="animate-pulse-subtle bg-primary/20 border border-primary rounded-full w-3 h-3">
                <span className="sr-only">Timer is running</span>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary">
                {currentActivity.title}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 p-0 ml-1 text-primary hover:text-primary/80 hover:bg-primary/10"
                      onClick={handleStopTimer}
                    >
                      <StopCircle className="h-4 w-4" />
                      <span className="sr-only">Stop Timer</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stop Timer</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto py-2 ">
          <nav className="grid items-start px-4 text-sm font-medium">
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50": pathname === "/dashboard"
              })}
              href="/dashboard"
            >
              <div className="border rounded-lg dark:bg-black dark:border-gray-800 border-gray-400 p-1 bg-white">
                <HomeIcon className="h-4 w-4" />
              </div>
              <span>Home</span>
            </Link>
            
            {/* Timer Link - Most important for time tracking */}
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50": pathname === "/dashboard/timer"
              })}
              href="/dashboard/timer"
            >
              <div className={clsx("border rounded-lg dark:bg-black dark:border-gray-800 border-gray-400 p-1 bg-white", {
                "border-primary bg-primary/10 text-primary animate-pulse-subtle": isRunning
              })}>
                <Timer className={clsx("h-3 w-3", { "text-primary": isRunning })} />
              </div>
              <span className="flex items-center gap-2">
                Timer
                {isRunning && (
                  <Badge variant="outline" className="ml-1 bg-primary/10 text-primary border-primary animate-pulse-subtle">
                    {formatTime(seconds)}
                  </Badge>
                )}
              </span>
            </Link>
            
            <Separator className="my-2" />
            <p className="px-3 py-1 text-xs text-muted-foreground">Tracking</p>
            
            {/* Courses Link */}
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50": pathname === "/dashboard/courses"
              })}
              href="/dashboard/courses"
            >
              <div className="border rounded-lg dark:bg-black dark:border-gray-800 border-gray-400 p-1 bg-white">
                <GraduationCap className="h-3 w-3" />
              </div>
              Courses
            </Link>
            
            {/* Projects Link */}
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50": pathname === "/dashboard/projects"
              })}
              href="/dashboard/projects"
            >
              <div className="border rounded-lg dark:bg-black dark:border-gray-800 border-gray-400 p-1 bg-white">
                <Folder className="h-3 w-3" />
              </div>
              Projects
            </Link>
            
            {/* Activities Link */}
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50": pathname === "/dashboard/activities"
              })}
              href="/dashboard/activities"
            >
              <div className="border rounded-lg dark:bg-black dark:border-gray-800 border-gray-400 p-1 bg-white">
                <LayoutList className="h-3 w-3" />
              </div>
              Activities
            </Link>
            
            <Separator className="my-2" />
            <p className="px-3 py-1 text-xs text-muted-foreground">History</p>
            
            {/* Sessions Link */}
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50": pathname === "/dashboard/sessions"
              })}
              href="/dashboard/sessions"
            >
              <div className="border rounded-lg dark:bg-black dark:border-gray-800 border-gray-400 p-1 bg-white">
                <Clock className="h-3 w-3" />
              </div>
              Sessions
            </Link>
            
            <Separator className="my-3" />
            <Link
              className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50", {
                "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50": pathname === "/dashboard/settings"
              })}
              href="/dashboard/settings"
              id="onboarding"
            >
              <div className="border rounded-lg dark:bg-black dark:border-gray-800 border-gray-400 p-1 bg-white">
                <Settings className="h-3 w-3" />
              </div>
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
