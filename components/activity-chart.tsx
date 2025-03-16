"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useAppContext } from '@/contexts/app-context'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { format, startOfDay, startOfWeek, startOfMonth, eachDayOfInterval, subDays, addDays } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Define session type to match the app context
type Session = {
  duration: number;
  date: Date;
  notes: string;
}

type ActivityChartProps = {
  period: 'day' | 'week' | 'month'
  onPeriodChange?: (period: 'day' | 'week' | 'month') => void
}

export function ActivityChart({ period, onPeriodChange }: ActivityChartProps) {
  const { activities } = useAppContext()
  const [selectedActivity, setSelectedActivity] = useState<string>('all')
  const [chartData, setChartData] = useState<any[]>([])
  
  // Extract all sessions from activities - using useMemo to prevent recalculation
  const allSessions = useMemo(() => {
    return activities.flatMap(activity => 
      activity.sessions.map(session => ({
        ...session,
        activityId: activity.id,
        activityTitle: activity.title,
        activityColor: activity.parentColor
      }))
    )
  }, [activities])
  
  // Get unique activities for the filter dropdown - using useMemo
  const activityOptions = useMemo(() => {
    return activities.map(activity => ({
      id: activity.id.toString(),
      title: activity.title,
      color: activity.parentColor
    }))
  }, [activities])
  
  // Generate time periods based on selected period
  useEffect(() => {
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
  }, [period, activities, allSessions, selectedActivity]) // Keep dependencies minimal and stable
  
  // Get all unique activity names that appear in the chart data
  const activityNames = useMemo(() => {
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
  
  // Generate colors for the bars - using useMemo
  const getActivityColor = useMemo(() => {
    // Map color names to actual colors
    const colorMap: Record<string, string> = {
      'primary': '#0ea5e9', // sky-500
      'secondary': '#8b5cf6', // violet-500
      'destructive': '#ef4444', // red-500
      'muted': '#6b7280', // gray-500
      'accent': '#22c55e', // green-500
      'popover': '#f97316', // orange-500
      'card': '#3b82f6', // blue-500
      'border': '#a855f7', // purple-500
      'green': '#22c55e', // green-500
      'red': '#ef4444', // red-500
      'blue': '#3b82f6', // blue-500
      'yellow': '#eab308', // yellow-500
      'purple': '#a855f7', // purple-500
      'teal': '#14b8a6', // teal-500
    }
    
    return (activityName: string) => {
      const activity = activities.find(a => a.title === activityName)
      if (!activity) return '#8884d8' // Default color
      return colorMap[activity.parentColor] || '#8884d8'
    }
  }, [activities])
  
  const handlePeriodChange = (value: string) => {
    if (onPeriodChange && (value === 'day' || value === 'week' || value === 'month')) {
      onPeriodChange(value)
    }
  }
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Select value={selectedActivity} onValueChange={setSelectedActivity}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All activities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activities</SelectItem>
            {activityOptions.map(activity => (
              <SelectItem key={activity.id} value={activity.id}>
                {activity.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Tabs value={period} onValueChange={handlePeriodChange}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="w-full aspect-[3/1] min-h-[200px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number) => [`${value} hours`, '']}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              {activityNames.map((activityName, index) => (
                <Bar 
                  key={index} 
                  dataKey={activityName} 
                  stackId="a" 
                  name={activityName}
                  fill={getActivityColor(activityName)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No activity data available for this period
          </div>
        )}
      </div>
    </div>
  )
}
