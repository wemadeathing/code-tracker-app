"use client"

import ModeToggle from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { UserProfile } from '@/components/user-profile'
import config from '@/config'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import { 
  Folder, 
  HomeIcon, 
  Settings, 
  Clock, 
  Timer, 
  GraduationCap, 
  LayoutList,
  StopCircle 
} from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'
import { useTimer } from '@/contexts/timer-context'
import { useAppContext } from '@/contexts/app-context'
import { Badge } from '@/components/ui/badge'
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

export default function DashboardTopNav({ children }: { children: ReactNode }) {
  const { isRunning, seconds, activeActivityId, stopTimer } = useTimer()
  const { activities } = useAppContext()

  // Get the current activity name if timer is running
  const currentActivity = activities.find(a => a.id === activeActivityId)

  // Handle stopping the timer
  const handleStopTimer = () => {
    stopTimer();
  };

  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[55px] items-center gap-4 border-b px-3">
        <Dialog>
          <SheetTrigger className="min-[1024px]:hidden p-2 transition">
            <HamburgerMenuIcon />
            <Link href="/dashboard">
              <span className="sr-only">Home</span>
            </Link>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <Link href="/">
                <SheetTitle>Nextjs Starter Kit</SheetTitle>
              </Link>
            </SheetHeader>
            <div className="flex flex-col space-y-3 mt-[1rem]">
              <DialogClose asChild>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    <HomeIcon className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              </DialogClose>
              
              <DialogClose asChild>
                <Link href="/dashboard/timer">
                  <Button variant="outline" className="w-full">
                    <Timer className="mr-2 h-4 w-4" />
                    Timer
                  </Button>
                </Link>
              </DialogClose>
              
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground px-2">Tracking</p>
              
              <DialogClose asChild>
                <Link href="/dashboard/courses">
                  <Button variant="outline" className="w-full">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Courses
                  </Button>
                </Link>
              </DialogClose>
              
              <DialogClose asChild>
                <Link href="/dashboard/projects">
                  <Button variant="outline" className="w-full">
                    <Folder className="mr-2 h-4 w-4" />
                    Projects
                  </Button>
                </Link>
              </DialogClose>
              
              <DialogClose asChild>
                <Link href="/dashboard/activities">
                  <Button variant="outline" className="w-full">
                    <LayoutList className="mr-2 h-4 w-4" />
                    Activities
                  </Button>
                </Link>
              </DialogClose>
              
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground px-2">History</p>
              
              <DialogClose asChild>
                <Link href="/dashboard/sessions">
                  <Button variant="outline" className="w-full">
                    <Clock className="mr-2 h-4 w-4" />
                    Sessions
                  </Button>
                </Link>
              </DialogClose>
              
              <Separator className="my-2" />
              <DialogClose asChild>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </DialogClose>
            </div>
          </SheetContent>
        </Dialog>
        
        {/* Active Timer Display for Mobile */}
        {isRunning && currentActivity && (
          <div className="flex items-center gap-2 mr-auto">
            <div className="animate-pulse-subtle bg-primary/20 border border-primary rounded-full w-3 h-3">
              <span className="sr-only">Timer is running</span>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary">
              {currentActivity.title}: {formatTime(seconds)}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 p-0 text-primary hover:text-primary/80 hover:bg-primary/10"
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
        
        <div className="flex justify-center items-center gap-2 ml-auto">
          {config?.auth?.enabled && <UserProfile />}
          <ModeToggle />
        </div>
      </header>
      {children}
    </div>
  )
}
