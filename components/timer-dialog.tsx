"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Timer } from '@/components/ui/timer'
import { CheckCircle } from 'lucide-react'
import { ActivityType } from '@/contexts/app-context'

interface TimerDialogProps {
  isOpen: boolean
  onClose: () => void
  activity: ActivityType
  onSaveTime: (seconds: number, notes: string) => void
}

export function TimerDialog({ isOpen, onClose, activity, onSaveTime }: TimerDialogProps) {
  const [seconds, setSeconds] = useState(0)
  const [notes, setNotes] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)

  const handleSave = () => {
    onSaveTime(seconds, notes)
    resetDialog()
    onClose()
  }

  const resetDialog = () => {
    setSeconds(0)
    setNotes('')
    setIsCompleted(false)
  }

  const handleClose = () => {
    resetDialog()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                initialSeconds={0} 
                onUpdate={setSeconds}
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
            <Button onClick={handleSave}>
              Save
            </Button>
          ) : (
            <Button 
              onClick={() => setIsCompleted(true)}
              className="w-full"
            >
              Complete Session
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
