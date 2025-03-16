"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ActivityType } from '@/contexts/app-context'

interface LogTimeDialogProps {
  isOpen: boolean
  onClose: () => void
  activity: ActivityType
  onSaveTime: (seconds: number, notes: string) => void
}

export function LogTimeDialog({ isOpen, onClose, activity, onSaveTime }: LogTimeDialogProps) {
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('0')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleSave = () => {
    // Validate inputs
    const hoursNum = parseInt(hours, 10) || 0
    const minutesNum = parseInt(minutes, 10) || 0
    
    if (hoursNum === 0 && minutesNum === 0) {
      setError('Please enter a valid time')
      return
    }

    // Calculate total seconds
    const totalSeconds = (hoursNum * 60 * 60) + (minutesNum * 60)
    
    // Call the onSaveTime callback
    onSaveTime(totalSeconds, notes)
    
    // Reset form
    setHours('0')
    setMinutes('0')
    setNotes('')
    setError('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Time for {activity.title}</DialogTitle>
          <DialogDescription>
            Record time you've already spent on this activity.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="time-input">Time Spent</Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Input
                  id="hours-input"
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => {
                    setHours(e.target.value)
                    setError('')
                  }}
                  className="w-20"
                />
                <span className="ml-2 text-sm">hours</span>
              </div>
              <div className="flex items-center">
                <Input
                  id="minutes-input"
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => {
                    setMinutes(e.target.value)
                    setError('')
                  }}
                  className="w-20"
                />
                <span className="ml-2 text-sm">minutes</span>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="What did you work on?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
