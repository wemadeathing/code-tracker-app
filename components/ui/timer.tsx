"use client"

import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTimer } from '@/contexts/timer-context'

interface TimerProps {
  initialSeconds?: number
  onUpdate?: (seconds: number) => void
  className?: string
  activityId?: number
}

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

export function Timer({ initialSeconds = 0, onUpdate, className, activityId }: TimerProps) {
  const { 
    seconds, 
    setSeconds, 
    isRunning, 
    activeActivityId,
    startTimer,
    stopTimer,
    resetTimer 
  } = useTimer()
  
  // Initialize seconds from props only on first render
  useEffect(() => {
    if (initialSeconds > 0 && seconds === 0) {
      setSeconds(initialSeconds)
    }
  }, [initialSeconds, seconds, setSeconds])
  
  // Use ref to keep track of latest onUpdate callback to avoid stale closures
  const onUpdateRef = useRef(onUpdate)
  
  // Update ref when onUpdate changes
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  // Call onUpdate whenever seconds changes
  useEffect(() => {
    if (onUpdateRef.current) {
      onUpdateRef.current(seconds)
    }
  }, [seconds]);

  const toggleTimer = () => {
    if (!activityId) return
    
    if (!isRunning || (isRunning && activeActivityId === activityId)) {
      if (isRunning) {
        stopTimer()
      } else {
        startTimer(activityId)
      }
    }
  }

  const handleReset = () => {
    if (activeActivityId === activityId || !activeActivityId) {
      resetTimer()
      if (onUpdateRef.current) onUpdateRef.current(0)
    }
  }

  // Determine if this timer instance can be controlled
  const canControl = !isRunning || (isRunning && activeActivityId === activityId)

  return (
    <div className={cn(
      "flex items-center space-x-2 p-2 rounded-md transition-all", 
      isRunning && activeActivityId === activityId
        ? "bg-primary/5 border border-primary animate-pulse-subtle" 
        : "border border-transparent",
      className
    )}>
      <div className="text-xl font-mono" aria-live="polite" role="timer">
        {formatTime(seconds)}
      </div>
      <div className="flex space-x-1">
        <Button 
          variant={isRunning && activeActivityId === activityId ? "secondary" : "outline"}
          size="icon" 
          onClick={toggleTimer}
          disabled={!canControl || !activityId}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
          className={isRunning && activeActivityId === activityId ? "text-primary" : ""}
        >
          {isRunning && activeActivityId === activityId ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleReset}
          disabled={!canControl}
          aria-label="Reset timer"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
