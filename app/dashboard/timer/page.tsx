"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Play, Pause, StopCircle, Plus } from 'lucide-react'
import { useAppContext, ActivityType } from '@/contexts/app-context'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function Timer() {
  const router = useRouter()
  const { 
    courses, 
    projects, 
    activities, 
    addActivity, 
    addTimeToActivity 
  } = useAppContext()
  
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [totalSeconds, setTotalSeconds] = useState<number>(0)
  const [timerStatus, setTimerStatus] = useState<'ready' | 'running' | 'paused'>('ready')
  const [selectedActivity, setSelectedActivity] = useState<string>('')
  const [activityType, setActivityType] = useState<'courses' | 'projects'>('courses')
  const [sessionNotes, setSessionNotes] = useState<string>('')
  const [showCompletionDialog, setShowCompletionDialog] = useState<boolean>(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Get activities for the selected type
  const filteredActivities = activities.filter(activity => {
    if (activityType === 'courses') {
      return activity.parentType === 'course'
    } else {
      return activity.parentType === 'project'
    }
  })

  // Timer logic
  useEffect(() => {
    if (timerStatus === 'running') {
      timerRef.current = setInterval(() => {
        setTotalSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1
          
          // Update the displayed time
          setTime({
            hours: Math.floor(newSeconds / 3600),
            minutes: Math.floor((newSeconds % 3600) / 60),
            seconds: newSeconds % 60
          })
          
          return newSeconds
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timerStatus])

  // Start/pause timer
  const toggleTimer = () => {
    if (timerStatus === 'ready' || timerStatus === 'paused') {
      setTimerStatus('running')
    } else {
      setTimerStatus('paused')
    }
  }

  // Complete timer session
  const completeSession = () => {
    setTimerStatus('paused')
    setShowCompletionDialog(true)
  }

  // Save completed session
  const saveSession = () => {
    if (selectedActivity && totalSeconds > 0) {
      const activityId = parseInt(selectedActivity)
      addTimeToActivity(activityId, totalSeconds, sessionNotes)
      
      // Reset timer
      setTime({ hours: 0, minutes: 0, seconds: 0 })
      setTotalSeconds(0)
      setTimerStatus('ready')
      setSessionNotes('')
      setShowCompletionDialog(false)
    }
  }

  // Format time to display with leading zeros
  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0')
  }

  // Navigate to add course/project page
  const handleAddNew = () => {
    if (activityType === 'courses') {
      router.push('/dashboard/courses')
    } else {
      router.push('/dashboard/projects')
    }
  }

  return (
    <div className='flex flex-col justify-center items-center w-full px-4 pt-8 gap-6'>
      <div className="w-full max-w-3xl">
        
        <Card className="mb-6">
          <CardContent className="py-6">
            <h2 className="text-lg font-medium mb-4">Activity Selection</h2>
            
            <Tabs value={activityType} onValueChange={(value) => {
              setActivityType(value as 'courses' | 'projects')
              setSelectedActivity('')
            }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="courses">Course Activities</TabsTrigger>
                <TabsTrigger value="projects">Project Activities</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <Select 
                value={selectedActivity} 
                onValueChange={setSelectedActivity}
                disabled={timerStatus !== 'ready' || filteredActivities.length === 0}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select an activity" />
                </SelectTrigger>
                <SelectContent>
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id.toString()}>
                        {activity.title} ({activity.parentTitle})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No activities available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleAddNew}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add {activityType === 'courses' ? 'Course' : 'Project'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardContent className="py-10 flex justify-center items-center flex-col">
            <h2 className="text-lg font-medium mb-4">Elapsed Time</h2>
            
            <div className="font-mono text-6xl flex items-center justify-center mb-2">
              <span className="tabular-nums">{formatTime(time.hours)}</span>
              <span className="mx-1">:</span>
              <span className="tabular-nums">{formatTime(time.minutes)}</span>
              <span className="mx-1">:</span>
              <span className="tabular-nums">{formatTime(time.seconds)}</span>
            </div>
            
            <div className="text-sm text-muted-foreground mt-2">
              {timerStatus === 'ready' ? 'Ready to start' : 
               timerStatus === 'running' ? 'Timer running' : 'Timer paused'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="py-6">
            <h2 className="text-lg font-medium mb-4">Session Controls</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button 
                className="w-full" 
                size="lg" 
                onClick={toggleTimer}
                disabled={!selectedActivity}
              >
                {timerStatus === 'running' ? 
                  <><Pause className="mr-2 h-4 w-4" />Pause Session</> : 
                  <><Play className="mr-2 h-4 w-4" />Start Session</>
                }
              </Button>
              
              <Button 
                className="w-full" 
                size="lg" 
                variant="secondary"
                onClick={completeSession}
                disabled={timerStatus === 'ready' || !selectedActivity || totalSeconds === 0}
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Complete Session
              </Button>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Keyboard Shortcuts</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Start/Pause Session</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-background rounded border">⌘/ctrl + S</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Complete Session</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-background rounded border">⌘/ctrl + Enter</kbd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Session Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Completed</DialogTitle>
            <DialogDescription>
              Add notes about what you accomplished during this session.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="What did you accomplish in this session? (optional)"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompletionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveSession}>
              Save Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
