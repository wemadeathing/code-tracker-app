"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Play, Plus } from 'lucide-react'

export default function Timer() {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [timerStatus, setTimerStatus] = useState<'ready' | 'running' | 'paused'>('ready')
  const [selectedActivity, setSelectedActivity] = useState<string>('')
  const [activityType, setActivityType] = useState<'courses' | 'projects'>('courses')

  // Format time to display with leading zeros
  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0')
  }

  return (
    <div className='flex flex-col justify-center items-center w-full px-4 pt-8 gap-6'>
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Timer</h1>
        
        <Card className="mb-6">
          <CardContent className="py-6">
            <h2 className="text-lg font-medium mb-4">Activity Selection</h2>
            
            <Tabs value={activityType} onValueChange={(value) => setActivityType(value as 'courses' | 'projects')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={activityType === 'courses' ? "HTML" : "Select a project"} />
                </SelectTrigger>
                <SelectContent>
                  {activityType === 'courses' ? (
                    <>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="python">Python Programming</SelectItem>
                      <SelectItem value="arabica">Arabica website</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="project1">Project 1</SelectItem>
                      <SelectItem value="project2">Project 2</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add Course</p>
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
            
            <div className="text-sm text-muted-foreground">
              {timerStatus}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="py-6">
            <h2 className="text-lg font-medium mb-4">Session Controls</h2>
            
            <Button className="w-full mb-6" size="lg">
              <Play className="mr-2 h-4 w-4" />
              Start Session
            </Button>
            
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Keyboard Shortcuts</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm">Start Session</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-background rounded border">⌘/ctrl + S</kbd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
