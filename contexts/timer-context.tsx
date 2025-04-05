"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface TimerContextType {
  isRunning: boolean
  setIsRunning: (isRunning: boolean) => void
  seconds: number
  setSeconds: (seconds: number) => void
  activeActivityId: number | null
  setActiveActivityId: (id: number | null) => void
  startTimer: (activityId: number) => void
  stopTimer: () => void
  resetTimer: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

// Load timer state from localStorage
const loadTimerState = () => {
  if (typeof window === 'undefined') return null
  
  const savedState = localStorage.getItem('timerState')
  if (!savedState) return null
  
  try {
    const state = JSON.parse(savedState)
    // Calculate elapsed time since last save
    if (state.isRunning && state.lastSaved) {
      const elapsedSeconds = Math.floor((Date.now() - state.lastSaved) / 1000)
      state.seconds += elapsedSeconds
    }
    return state
  } catch (error) {
    console.error('Error loading timer state:', error)
    return null
  }
}

export function TimerProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage or defaults
  const initialState = loadTimerState() || {
    isRunning: false,
    seconds: 0,
    activeActivityId: null
  }
  
  const [isRunning, setIsRunning] = useState(initialState.isRunning)
  const [seconds, setSeconds] = useState(initialState.seconds)
  const [activeActivityId, setActiveActivityId] = useState<number | null>(initialState.activeActivityId)

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timerState', JSON.stringify({
        isRunning,
        seconds,
        activeActivityId,
        lastSaved: Date.now()
      }))
    }
  }, [isRunning, seconds, activeActivityId])
  
  // Set up interval for continuous counting if the timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds: number) => {
          const newSeconds = prevSeconds + 1
          return newSeconds
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  // Helper functions for timer control
  const startTimer = (activityId: number) => {
    setActiveActivityId(activityId)
    setIsRunning(true)
  }

  const stopTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setSeconds(0)
    setActiveActivityId(null)
    localStorage.removeItem('timerState')
  }

  return (
    <TimerContext.Provider value={{ 
      isRunning, 
      setIsRunning, 
      seconds, 
      setSeconds,
      activeActivityId,
      setActiveActivityId,
      startTimer,
      stopTimer,
      resetTimer
    }}>
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
