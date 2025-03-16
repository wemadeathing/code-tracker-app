"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart } from "@/components/ui/chart"
import { format, startOfDay, startOfWeek, startOfMonth, subDays, addDays, eachDayOfInterval } from 'date-fns'

// Define session type to match the app context
type Session = {
  duration: number;
  date: Date;
  notes: string;
}

interface ActivityChartProps {
  activities: Array<{
    id: number;
    title: string;
    parentColor: string;
    sessions: Session[];
  }>;
  period: 'day' | 'week' | 'month';
  onPeriodChange?: (period: 'day' | 'week' | 'month') => void;
  className?: string;
}

export function ActivityChart({ 
  activities, 
  period = 'day', 
  onPeriodChange,
  className 
}: ActivityChartProps) {
  const [selectedActivity, setSelectedActivity] = React.useState<string>("all")
  const [chartData, setChartData] = React.useState<any[]>([])

  // Extract all sessions from activities
  const allSessions = React.useMemo(() => {
    return activities.flatMap(activity => 
      activity.sessions.map(session => ({
        ...session,
        activityId: activity.id,
        activityTitle: activity.title,
        activityColor: activity.parentColor
      }))
    )
  }, [activities])

  // Get unique activities for the filter dropdown
  const activityOptions = React.useMemo(() => {
    return activities.map(activity => ({
      id: activity.id.toString(),
      title: activity.title,
      color: activity.parentColor
    }))
  }, [activities])

  // Generate time periods based on selected period
  React.useEffect(() => {
    const today = new Date()
    let startDate: Date
    let dateFormat: string
    
    // Set the start date and format based on period
    if (period === 'day') {
      startDate = startOfDay(subDays(today, 6)) // Last 7 days
      dateFormat = 'EEE' // Tue, Wed, etc.
    } else if (period === 'week') {
      startDate = startOfWeek(subDays(today, 28)) // Last 5 weeks
      dateFormat = "'W'w" // W1, W2, etc.
    } else {
      startDate = startOfMonth(subDays(today, 150)) // Last 6 months
      dateFormat = 'MMM' // Jan, Feb, etc.
    }
    
    // Generate dates for the chart
    const dates = period === 'day' 
      ? eachDayOfInterval({ start: startDate, end: today })
      : period === 'week'
        ? Array.from({ length: 5 }, (_, i) => subDays(today, (4-i) * 7))
        : Array.from({ length: 6 }, (_, i) => {
            const date = new Date(today)
            date.setMonth(today.getMonth() - (5-i))
            return startOfMonth(date)
          })
    
    // Process session data for the chart
    const data = dates.map(date => {
      const dateStr = format(date, dateFormat)
      const dateObj: Record<string, any> = { name: dateStr, date }
      
      // Filter sessions by date and selected activity
      const relevantSessions = allSessions.filter(session => {
        const sessionDate = new Date(session.date)
        const isInPeriod = period === 'day'
          ? format(sessionDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          : period === 'week'
            ? sessionDate >= startOfWeek(date) && sessionDate < startOfWeek(addDays(date, 7))
            : sessionDate.getMonth() === date.getMonth() && sessionDate.getFullYear() === date.getFullYear()
        
        const isSelectedActivity = selectedActivity === 'all' || 
          session.activityId === parseInt(selectedActivity)
        
        return isInPeriod && isSelectedActivity
      })
      
      // Group sessions by activity
      const activityGroups = relevantSessions.reduce((acc: Record<string, number>, session) => {
        const activity = activities.find(a => a.id === session.activityId)
        if (!activity) return acc
        
        const key = activity.title
        if (!acc[key]) acc[key] = 0
        acc[key] += session.duration
        
        return acc
      }, {})
      
      // Add activity data to the date object
      Object.entries(activityGroups).forEach(([key, value]) => {
        dateObj[key] = Math.round(value / 3600 * 10) / 10 // Convert seconds to hours with 1 decimal
      })
      
      return dateObj
    })
    
    setChartData(data)
  }, [period, activities, allSessions, selectedActivity])

  // Get all unique activity names that appear in the chart data
  const activityNames = React.useMemo(() => {
    return Array.from(
      new Set(
        chartData.flatMap(item => 
          Object.keys(item).filter(key => 
            key !== 'name' && key !== 'date'
          )
        )
      )
    )
  }, [chartData])

  // Format categories for the chart
  const chartCategories = React.useMemo(() => {
    return activityNames.map((name) => {
      const activity = activities.find(a => a.title === name)
      return {
        name,
        key: name,
        color: activity ? `hsl(var(--${activity.parentColor}))` : undefined
      }
    })
  }, [activityNames, activities])

  const handlePeriodChange = (value: string) => {
    if (onPeriodChange && (value === 'day' || value === 'week' || value === 'month')) {
      onPeriodChange(value as 'day' | 'week' | 'month')
    }
  }

  // Format hours for the chart
  const formatHours = (value: number) => `${value}h`

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-md font-medium">Activity Overview</CardTitle>
        <div className="flex items-center space-x-2">
          <Tabs value={period} onValueChange={handlePeriodChange}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="mb-6">
          <Select value={selectedActivity} onValueChange={setSelectedActivity}>
            <SelectTrigger className="w-[200px] h-10">
              <SelectValue placeholder="All activities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All activities</SelectItem>
              {activityOptions.map(activity => (
                <SelectItem key={activity.id} value={activity.id}>
                  <div className="flex items-center">
                    <span 
                      className="mr-2 h-3 w-3 rounded-full" 
                      style={{ backgroundColor: `hsl(var(--${activity.color}))` }}
                    />
                    {activity.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {chartData.length > 0 && chartCategories.length > 0 ? (
          <BarChart 
            data={chartData}
            index="name"
            categories={chartCategories}
            valueFormatter={formatHours}
            className="h-[300px]"
            showGrid={true}
            showLegend={true}
            showTooltip={true}
            stack={true}
          />
        ) : (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
            No activity data available for this period
          </div>
        )}
      </CardContent>
    </Card>
  )
}
