"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface TimerContextType {
  isRunning: boolean
  setIsRunning: (isRunning: boolean) => void
  seconds: number
  setSeconds: (seconds: number) => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  
  // Set up interval for continuous counting if the timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1)
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  return (
    <TimerContext.Provider value={{ isRunning, setIsRunning, seconds, setSeconds }}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}
