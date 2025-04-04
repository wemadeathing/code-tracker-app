"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, Clock, Calendar, Flame, Plus } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect, useRef } from 'react'
import { ActivityChart } from '@/components/ui/activity-chart'
import { useAppContext } from '@/contexts/app-context'
import { format, startOfDay, startOfWeek, startOfMonth, subDays, isWithinInterval, eachDayOfInterval } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { activities, formatTimeFromSeconds, addTimeToActivity } = useAppContext()
  const [selectedTab, setSelectedTab] = useState<"day" | "week" | "month">("day")
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const datePickerRef = useRef<HTMLDivElement>(null)
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('0')
  const [notes, setNotes] = useState('')
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    streak: 0
  })

  useEffect(() => {
    const today = startOfDay(new Date())
    const startOfCurrentWeek = startOfWeek(today)
    const startOfCurrentMonth = startOfMonth(today)
    
    let todaySeconds = 0
    let weekSeconds = 0
    let monthSeconds = 0
    
    // Calculate streak - active days in a row
    const activeDatesSet = new Set()
    const sortedDates: Date[] = []
    
    // Process all activities to get stats
    activities.forEach(activity => {
      if (!activity.sessions) return
      
      activity.sessions.forEach(session => {
        const sessionDate = new Date(session.date)
        const sessionDay = startOfDay(sessionDate)
        
        // Add to unique dates set for streak calculation
        activeDatesSet.add(sessionDay.toISOString().split('T')[0])
        sortedDates.push(sessionDay)
        
        if (isWithinInterval(sessionDay, { start: today, end: today })) {
          todaySeconds += session.duration
        }
        
        if (isWithinInterval(sessionDay, { start: startOfCurrentWeek, end: today })) {
          weekSeconds += session.duration
        }
        
        if (isWithinInterval(sessionDay, { start: startOfCurrentMonth, end: today })) {
          monthSeconds += session.duration
        }
      })
    })
    
    // Calculate streaks
    let currentStreak = 0
    
    // Only calculate streak if there are recorded sessions
    if (sortedDates.length > 0) {
      // Sort dates (newest first) and deduplicate them
      const uniqueSortedDays = Array.from(activeDatesSet).sort().reverse()
      
      let currentDate = today
      const todayString = currentDate.toISOString().split('T')[0]
      
      // If today has activity, start counting streak from today
      const startIndex = uniqueSortedDays[0] === todayString ? 0 : -1
      
      if (startIndex === 0) {
        currentStreak = 1
        let i = 1
        let prevDay = today
        
        while (i < uniqueSortedDays.length) {
          const yesterday = subDays(prevDay, 1)
          const yesterdayString = yesterday.toISOString().split('T')[0]
          
          if (uniqueSortedDays[i] === yesterdayString) {
            currentStreak++
            prevDay = yesterday
          } else {
            break
          }
          i++
        }
      }
    }
    
    setStats({
      today: todaySeconds,
      week: weekSeconds,
      month: monthSeconds,
      streak: currentStreak
    })
  }, [activities])
  
  // Get recent sessions for the Recent Sessions card
  const recentSessions = activities
    .flatMap(activity => {
      if (!activity.sessions) return []
      
      return activity.sessions.map(session => ({
        activityId: activity.id,
        activityTitle: activity.title,
        date: new Date(session.date),
        duration: session.duration,
        activityColor: activity.parentColor || "primary"
      }))
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Get top activities for the Activity Progress card
  const topActivities = [...activities]
    .sort((a, b) => (b.totalSeconds || 0) - (a.totalSeconds || 0))
    .slice(0, 5)

  // Prepare activities for ActivityChart by ensuring they have the right structure
  const chartActivities = activities.map(activity => ({
    id: activity.id,
    title: activity.title,
    parentColor: activity.parentColor || 'primary',
    sessions: activity.sessions?.map(session => ({
      duration: session.duration,
      date: new Date(session.date),
      notes: session.notes || ""
    })) || []
  }))

  // Function to log past time with a specific date
  const logPastTime = async (activityId: number, seconds: number, notes: string, date: Date) => {
    try {
      // Use the addTimeToActivity function from the context with the selected date
      await addTimeToActivity(activityId, seconds, notes, date);
    } catch (error) {
      console.error('Error logging past time:', error);
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <div className='flex flex-col justify-center items-start flex-wrap px-4 pt-4 gap-4'>
      <div className="flex justify-between items-center w-full">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* Log Past Time and Start Coding Buttons */}
        <div className="flex gap-2">
          <Dialog open={isLogTimeOpen} onOpenChange={(open) => {
            // If we're closing the dialog, reset the form
            if (!open) {
              setSelectedActivity("");
              setSelectedDate(new Date());
              setHours('0');
              setMinutes('0');
              setNotes('');
            }
            setIsLogTimeOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">Log Past Time</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Log Past Time</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="activity">Activity</Label>
                  <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                    <SelectTrigger id="activity">
                      <SelectValue placeholder="Select an activity" />
                    </SelectTrigger>
                    <SelectContent>
                      {activities.map(activity => (
                        <SelectItem key={activity.id} value={activity.id.toString()}>
                          {activity.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <div
                      className={cn(
                        "flex h-10 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "MMMM do, yyyy")}
                    </div>
                    <div className="p-3 border rounded-md">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) setSelectedDate(date);
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="hours">Hours</Label>
                    <Input 
                      type="number" 
                      id="hours" 
                      placeholder="0" 
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minutes">Minutes</Label>
                    <Input 
                      type="number" 
                      id="minutes" 
                      placeholder="0" 
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input 
                    id="notes" 
                    placeholder="What did you work on?" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  className="w-full"
                  onClick={() => {
                    // Validate inputs
                    if (!selectedActivity) {
                      // You could add proper validation feedback here
                      return;
                    }
                    
                    const hoursNum = parseInt(hours, 10) || 0;
                    const minutesNum = parseInt(minutes, 10) || 0;
                    
                    if (hoursNum === 0 && minutesNum === 0) {
                      // You could add validation feedback here
                      return;
                    }
                    
                    // Calculate total seconds
                    const totalSeconds = (hoursNum * 60 * 60) + (minutesNum * 60);
                    
                    // Get the activity ID
                    const activityId = parseInt(selectedActivity);
                    
                    // Log the time with the selected date
                    if (selectedDate) {
                      logPastTime(activityId, totalSeconds, notes, selectedDate);
                    }
                    
                    // Close the dialog and reset form
                    setIsLogTimeOpen(false);
                    setSelectedActivity("");
                    setSelectedDate(new Date());
                    setHours('0');
                    setMinutes('0');
                    setNotes('');
                  }}
                >
                  Log Time
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link href="/dashboard/timer" className="flex items-center gap-1">
              Start Coding <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col w-full gap-4 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Stats Cards */}
          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-background to-background/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-4 px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <Clock className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pt-2 pb-4">
              <div className="text-3xl font-bold tracking-tight">{formatTimeFromSeconds(stats.today)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Coded Today
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-background to-background/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-4 px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pt-2 pb-4">
              <div className="text-3xl font-bold tracking-tight">{formatTimeFromSeconds(stats.week)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Coded This Week
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-background to-background/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-4 px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pt-2 pb-4">
              <div className="text-3xl font-bold tracking-tight">{formatTimeFromSeconds(stats.month)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Coded This Month
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-background to-background/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-4 px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <Flame className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pt-2 pb-4">
              <div className="text-3xl font-bold tracking-tight">{stats.streak} days</div>
              <p className="text-xs text-muted-foreground mt-1">
                Consecutive days coding
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coding Activity Chart */}
        <ActivityChart 
          activities={chartActivities} 
          period={selectedTab} 
          onPeriodChange={setSelectedTab} 
          className="w-full mt-6"
        />

        {/* Recent Sessions and Activity Progress */}
        <div className="grid md:grid-cols-2 gap-4 w-full mt-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(var(--${session.activityColor}))` }}></div>
                        <div>
                          <div className="font-medium">{session.activityTitle}</div>
                          <div className="text-xs text-muted-foreground">{format(session.date, 'dd/MM/yyyy')}</div>
                        </div>
                      </div>
                      <div className="text-sm">{formatTimeFromSeconds(session.duration)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No recent sessions recorded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topActivities.length > 0 ? (
                  topActivities.map(activity => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(var(--${activity.parentColor}))` }}></div>
                        <div className="font-medium">{activity.title}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">{activity.totalTime}</div>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No activities recorded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
