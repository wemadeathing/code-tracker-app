"use client"

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { Calendar as CalendarIcon, X, Download, Trash2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { useAppContext } from '@/contexts/app-context'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

type SessionWithDetails = {
  id: string
  activityId: number
  activityTitle: string
  parentTitle: string
  parentColor: string
  parentType: 'course' | 'project'
  date: Date
  duration: number
  formattedDuration: string
  notes: string
}

export default function Sessions() {
  const { activities, deleteSessionFromActivity, formatTimeFromSeconds } = useAppContext()
  const [selectedActivity, setSelectedActivity] = useState<string>("all")
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all-time")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)
  const [selectedSessionForDeletion, setSelectedSessionForDeletion] = useState<SessionWithDetails | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)

  // Collect all sessions from all activities
  const allSessions = useMemo(() => {
    const sessions: SessionWithDetails[] = []
    
    activities.forEach(activity => {
      if (activity.sessions && activity.sessions.length > 0) {
        activity.sessions.forEach((session, index) => {
          sessions.push({
            id: `${activity.id}-${index}`,
            activityId: activity.id,
            activityTitle: activity.title,
            parentTitle: activity.parentTitle,
            parentColor: activity.parentColor,
            parentType: activity.parentType,
            date: new Date(session.date),
            duration: session.duration,
            formattedDuration: formatTimeFromSeconds(session.duration),
            notes: session.notes || "No notes"
          })
        })
      }
    })
    
    // Sort by date (newest first)
    return sessions.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [activities, formatTimeFromSeconds])

  // Filter sessions based on selected activity and date
  const filteredSessions = useMemo(() => {
    return allSessions.filter(session => {
      // Filter by activity
      const activityMatch = selectedActivity === "all" || 
        selectedActivity === session.activityId.toString();
      
      // Filter by date range
      let dateMatch = true;
      if (selectedDateRange === "custom" && date) {
        const selectedDate = startOfDay(date);
        const sessionDate = startOfDay(session.date);
        dateMatch = selectedDate.getTime() === sessionDate.getTime();
      }
      
      return activityMatch && dateMatch;
    });
  }, [allSessions, selectedActivity, selectedDateRange, date]);

  // Format time range (not implemented in stored data, so we'll skip this)
  const formatTimeRange = (date: Date, duration: number) => {
    return "N/A"; // We don't store start and end times, just duration
  };

  // Handle session deletion
  const handleDeleteSession = () => {
    if (selectedSessionForDeletion) {
      const [activityId, sessionIndex] = selectedSessionForDeletion.id.split('-').map(Number);
      deleteSessionFromActivity(activityId, sessionIndex);
      setIsDeleteDialogOpen(false);
      setSelectedSessionForDeletion(null);
    }
  };

  return (
    <div className='flex flex-col justify-center items-start w-full px-4 pt-4 gap-4'>
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full mb-4">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Sessions</h1>
        <Button variant="outline" className="self-end md:self-auto">
          <Download className="mr-2 h-4 w-4" />
          Export Sessions
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 w-full mb-6">
        <Select
          value={selectedActivity}
          onValueChange={setSelectedActivity}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All activities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activities</SelectItem>
            <div className="px-2 py-1.5 text-sm font-semibold">Activities</div>
            {activities.map((activity) => (
              <SelectItem key={activity.id} value={activity.id.toString()}>
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: `hsl(var(--${activity.parentColor}))` }}
                  ></div>
                  {activity.title}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedDateRange}
          onValueChange={setSelectedDateRange}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-time">All time</SelectItem>
            <SelectItem value="custom">Custom date</SelectItem>
          </SelectContent>
        </Select>

        {selectedDateRange === "custom" && (
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  setDate(date)
                  setIsCalendarOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Applied filters */}
        {(selectedActivity !== "all" || selectedDateRange !== "all-time") && (
          <div className="flex items-center mt-2 sm:mt-0">
            {selectedDateRange === "custom" && date && (
              <Badge variant="secondary" className="flex items-center gap-1 mr-2">
                On {format(date, "MMM d, yyyy")}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setDate(undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setSelectedActivity("all")
                setSelectedDateRange("all-time")
                setDate(undefined)
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Sessions table */}
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="border-b">
            <div className="grid grid-cols-12 px-4 py-3 text-sm font-medium text-muted-foreground">
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Activity</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-3">Notes</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
          </div>
          <div>
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <div key={session.id} className="grid grid-cols-12 px-4 py-4 border-b items-center">
                  <div className="col-span-2 text-sm">{format(session.date, "MMM d, yyyy")}</div>
                  <div className="col-span-3 flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: `hsl(var(--${session.parentColor}))` }}
                    ></div>
                    <div>
                      <div>{session.activityTitle}</div>
                      <div className="text-xs text-muted-foreground">{session.parentTitle}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm">{session.formattedDuration}</div>
                  <div className="col-span-3 text-sm text-muted-foreground line-clamp-2">{session.notes}</div>
                  <div className="col-span-2 flex justify-end">
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => setSelectedSessionForDeletion(session)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Session</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this session? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setSelectedSessionForDeletion(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteSession}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center py-8 text-center">
                <div className="flex flex-col items-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-lg font-medium">No sessions found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedActivity !== "all" || selectedDateRange !== "all-time" 
                      ? "Try changing your filters" 
                      : "Start a timer session to track your progress"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
