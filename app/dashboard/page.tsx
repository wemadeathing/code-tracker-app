"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, Clock, Calendar, Flame, Plus } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { ActivityChart } from '@/components/ui/activity-chart'
import { useAppContext } from '@/contexts/app-context'
import { format, startOfDay, startOfWeek, startOfMonth, subDays, isWithinInterval, eachDayOfInterval } from 'date-fns'

export default function Dashboard() {
  const { activities, formatTimeFromSeconds } = useAppContext()
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<"day" | "week" | "month">("day")
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    streak: 0
  })

  // Calculate dashboard stats based on activity sessions
  useEffect(() => {
    const now = new Date()
    const today = startOfDay(now)
    const weekStart = startOfWeek(now)
    const monthStart = startOfMonth(now)
    
    // Extract all sessions from activities
    const allSessions = activities.flatMap(activity => 
      activity.sessions.map(session => ({
        ...session,
        activityId: activity.id,
        activityTitle: activity.title
      }))
    )
    
    // Calculate time for today, this week, and this month
    const todaySeconds = allSessions.reduce((total, session) => {
      const sessionDate = new Date(session.date)
      if (format(sessionDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        return total + session.duration
      }
      return total
    }, 0)
    
    const weekSeconds = allSessions.reduce((total, session) => {
      const sessionDate = new Date(session.date)
      if (isWithinInterval(sessionDate, { start: weekStart, end: now })) {
        return total + session.duration
      }
      return total
    }, 0)
    
    const monthSeconds = allSessions.reduce((total, session) => {
      const sessionDate = new Date(session.date)
      if (isWithinInterval(sessionDate, { start: monthStart, end: now })) {
        return total + session.duration
      }
      return total
    }, 0)
    
    // Calculate streak (consecutive days with activity)
    let streak = 0
    let currentDate = today
    
    while (true) {
      // Check if there's any activity on this day
      const hasActivity = allSessions.some(session => {
        const sessionDate = new Date(session.date)
        return format(sessionDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
      })
      
      if (!hasActivity) break
      
      streak++
      currentDate = subDays(currentDate, 1)
    }
    
    setStats({
      today: todaySeconds,
      week: weekSeconds,
      month: monthSeconds,
      streak
    })
  }, [activities])

  // Get recent sessions for the Recent Sessions card
  const recentSessions = activities
    .flatMap(activity => 
      activity.sessions.map(session => ({
        ...session,
        activityId: activity.id,
        activityTitle: activity.title,
        activityColor: activity.parentColor
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Get top activities for the Activity Progress card
  const topActivities = [...activities]
    .sort((a, b) => b.totalSeconds - a.totalSeconds)
    .slice(0, 5)

  return (
    <div className='flex flex-col justify-center items-start flex-wrap px-4 pt-4 gap-4'>
      <div className="flex justify-between items-center w-full">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* Log Past Time and Start Coding Buttons */}
        <div className="flex gap-2">
          <Dialog open={isLogTimeOpen} onOpenChange={setIsLogTimeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Log Past Time</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Log Past Time</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Activity Type</Label>
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 bg-background">Courses</Button>
                    <Button variant="outline" className="flex-1">Projects</Button>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="activity">Activity</Label>
                  <Select>
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
                  <div className="relative">
                    <Input
                      type="text"
                      id="date"
                      placeholder={format(new Date(), 'MMMM do, yyyy')}
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="hours">Hours</Label>
                    <Input type="number" id="hours" placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minutes">Minutes</Label>
                    <Input type="number" id="minutes" placeholder="0" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input id="notes" placeholder="What did you work on?" />
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full">Log Time</Button>
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
      
      <div className="flex flex-wrap w-full gap-4 mt-2">
        {/* Stats Cards */}
        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTimeFromSeconds(stats.today)}</div>
            <p className="text-xs text-muted-foreground">
              Coded Today
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTimeFromSeconds(stats.week)}</div>
            <p className="text-xs text-muted-foreground">
              Coded This Week
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTimeFromSeconds(stats.month)}</div>
            <p className="text-xs text-muted-foreground">
              Coded This Month
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak} days</div>
            <p className="text-xs text-muted-foreground">
              Consecutive days coding
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Coding Activity Chart */}
      <ActivityChart 
        activities={activities} 
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
                        <div className="text-xs text-muted-foreground">{format(new Date(session.date), 'dd/MM/yyyy')}</div>
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
  )
}
