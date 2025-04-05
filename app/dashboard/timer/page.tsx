"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Play, Pause, StopCircle, Plus, AlertCircle } from 'lucide-react'
import { useAppContext } from '@/contexts/app-context'
import { Textarea } from '@/components/ui/textarea'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useTimer } from '@/contexts/timer-context'
import { Timer as TimerComponent } from '@/components/ui/timer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function TimerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { 
    courses, 
    projects, 
    activities, 
    addTimeToActivity 
  } = useAppContext()
  
  const { 
    isRunning,
    seconds,
    activeActivityId,
    startTimer,
    stopTimer,
    resetTimer
  } = useTimer()
  
  const [selectedActivity, setSelectedActivity] = useState<string>('')
  const [activityType, setActivityType] = useState<'courses' | 'projects'>('courses')
  const [sessionNotes, setSessionNotes] = useState<string>('')
  const [showCompletionDialog, setShowCompletionDialog] = useState<boolean>(false)

  // Get the current active activity if timer is running
  const currentActivity = activities.find(activity => activity.id === activeActivityId)

  // Get activities for the selected type
  const filteredActivities = activities.filter(activity => {
    if (activityType === 'courses') {
      return activity.parentType === 'course'
    } else {
      return activity.parentType === 'project'
    }
  })

  // Sync selected activity with active timer
  useEffect(() => {
    if (isRunning && activeActivityId && !selectedActivity) {
      setSelectedActivity(activeActivityId.toString())
      
      // Also set the correct tab based on the active activity
      const activity = activities.find(a => a.id === activeActivityId)
      if (activity) {
        setActivityType(activity.parentType === 'course' ? 'courses' : 'projects')
      }
    }
  }, [isRunning, activeActivityId, selectedActivity, activities])

  // Check for activity ID in URL params
  useEffect(() => {
    const activityId = searchParams.get('activity')
    if (activityId) {
      setSelectedActivity(activityId)
      const activity = activities.find(a => a.id === parseInt(activityId))
      if (activity) {
        setActivityType(activity.parentType === 'course' ? 'courses' : 'projects')
      }
    }
  }, [searchParams, activities])

  // Complete timer session
  const completeSession = () => {
    if (!isRunning || !activeActivityId) return
    
    stopTimer()
    setShowCompletionDialog(true)
  }

  // Save completed session
  const saveSession = () => {
    if (activeActivityId && seconds > 0) {
      addTimeToActivity(activeActivityId, seconds, sessionNotes)
      
      // Reset everything
      resetTimer()
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

  // Handle timer controls
  const handleTimerAction = () => {
    if (!selectedActivity) return

    const activityId = parseInt(selectedActivity)
    if (!isRunning) {
      startTimer(activityId)
    } else if (activeActivityId === activityId) {
      stopTimer()
    }
  }

  return (
    <div className='flex flex-col justify-center items-center w-full px-4 pt-8 gap-6'>
      <div className="w-full max-w-3xl">
        
        {/* Show alert when timer is already running */}
        {isRunning && currentActivity && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">Active Timer</AlertTitle>
            <AlertDescription>
              Timer is currently running for "{currentActivity.title}" from {currentActivity.parentType === 'course' ? 'course' : 'project'} "{currentActivity.parentTitle}".
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="mb-6">
          <CardContent className="py-6">
            <h2 className="text-lg font-medium mb-4">Activity Selection</h2>
            
            <Tabs value={activityType} onValueChange={(value) => {
              setActivityType(value as 'courses' | 'projects')
              // Only clear selection if no timer is running
              if (!isRunning) {
                setSelectedActivity('')
              }
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
                disabled={isRunning && activeActivityId !== parseInt(selectedActivity)}
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
            
            <TimerComponent 
              activityId={selectedActivity ? parseInt(selectedActivity) : undefined}
              className="text-6xl font-mono"
            />
            
            <div className="text-sm text-muted-foreground mt-2">
              {!selectedActivity ? 'Select an activity to start' :
               isRunning && activeActivityId === parseInt(selectedActivity) ? 'Timer running' :
               isRunning ? 'Another timer is running' : 'Ready to start'}
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
                onClick={handleTimerAction}
                disabled={!selectedActivity || (isRunning && activeActivityId !== parseInt(selectedActivity))}
              >
                {isRunning && activeActivityId === parseInt(selectedActivity) ? 
                  <><Pause className="mr-2 h-4 w-4" />Pause Session</> : 
                  <><Play className="mr-2 h-4 w-4" />Start Session</>
                }
              </Button>
              
              <Button 
                className="w-full" 
                size="lg" 
                variant="secondary"
                onClick={completeSession}
                disabled={!isRunning || seconds === 0}
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
