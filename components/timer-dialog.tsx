"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Timer } from '@/components/ui/timer'
import { CheckCircle } from 'lucide-react'
import { ActivityType } from '@/contexts/app-context'
import { useTimer } from '@/contexts/timer-context'

interface TimerDialogProps {
  isOpen: boolean
  onClose: () => void
  activity: ActivityType
  onSaveTime: (seconds: number, notes: string) => void
}

export function TimerDialog({ isOpen, onClose, activity, onSaveTime }: TimerDialogProps) {
  const { seconds, resetTimer } = useTimer()
  const [notes, setNotes] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)

  // Reset dialog state when opened with a new activity
  useEffect(() => {
    if (isOpen) {
      resetDialog()
    }
  }, [isOpen, activity.id])

  const handleSave = () => {
    // Don't save if no time has been tracked
    if (seconds === 0) {
      handleClose()
      return
    }
    
    onSaveTime(seconds, notes)
    resetDialog()
    onClose()
  }

  const resetDialog = () => {
    setNotes('')
    setIsCompleted(false)
  }

  const handleClose = () => {
    // Show confirmation if timer is running and has time
    if (!isCompleted && seconds > 0) {
      if (window.confirm('You have unsaved time. Are you sure you want to close?')) {
        resetTimer()
        resetDialog()
        onClose()
      }
    } else {
      resetDialog()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isCompleted ? 'Session completed' : 'Track time for activity'}
          </DialogTitle>
          <DialogDescription>
            {isCompleted 
              ? 'Your time has been recorded. Add any notes about the session.'
              : `Timing: ${activity.title}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {isCompleted ? (
            <div className="flex items-center justify-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Timer 
                activityId={activity.id}
                className="text-4xl font-mono"
              />
            </div>
          )}
          
          {isCompleted && (
            <div>
              <Textarea
                placeholder="Add notes about what you accomplished (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          {isCompleted ? (
            <div className="flex w-full gap-2 justify-end">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setIsCompleted(true)}
              className="w-full"
              disabled={seconds === 0}
            >
              Complete Session
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
