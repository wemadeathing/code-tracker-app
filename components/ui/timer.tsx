"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimerProps {
  initialSeconds?: number
  onUpdate?: (seconds: number) => void
  className?: string
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

export function Timer({ initialSeconds = 0, onUpdate, className }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Use ref to keep track of latest onUpdate callback to avoid stale closures
  const onUpdateRef = useRef(onUpdate)
  
  // Update ref when onUpdate changes
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1
          if (onUpdateRef.current) onUpdateRef.current(newSeconds)
          return newSeconds
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setSeconds(0)
    if (onUpdateRef.current) onUpdateRef.current(0)
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="text-xl font-mono" aria-live="polite" role="timer">
        {formatTime(seconds)}
      </div>
      <div className="flex space-x-1">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleTimer}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={resetTimer}
          aria-label="Reset timer"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
