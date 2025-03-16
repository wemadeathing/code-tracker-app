"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, X, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function Sessions() {
  const [selectedActivity, setSelectedActivity] = useState<string>("all")
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all-time")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)

  // Dummy sessions data
  const sessions = [
    {
      id: 1,
      date: new Date(2025, 2, 11), // March 11, 2025
      activity: "Arabica website",
      color: "teal",
      duration: "6h 0m 0s",
      timeRange: "12:21 - 18:21",
      notes: "No notes"
    },
    {
      id: 2,
      date: new Date(2025, 2, 11), // March 11, 2025
      activity: "HTML",
      color: "red",
      duration: "3h 0m 0s",
      timeRange: "12:22 - 15:22",
      notes: "No notes"
    },
    {
      id: 3,
      date: new Date(2025, 2, 11), // March 11, 2025
      activity: "Python Programming",
      color: "green",
      duration: "52s",
      timeRange: "12:16 - 12:17",
      notes: "No notes"
    },
    {
      id: 4,
      date: new Date(2025, 2, 11), // March 11, 2025
      activity: "Python Programming",
      color: "green",
      duration: "5h 0m 0s",
      timeRange: "02:00 - 07:00",
      notes: "test"
    }
  ]

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
            <div className="px-2 py-1.5 text-sm font-semibold">Activities & Courses</div>
            <SelectItem value="all-activities">All activities</SelectItem>
            <SelectItem value="arabica">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-teal-500 mr-2"></div>
                Arabica website
              </div>
            </SelectItem>
            <SelectItem value="html">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                HTML
              </div>
            </SelectItem>
            <SelectItem value="python">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                Python Programming
              </div>
            </SelectItem>
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
            <SelectItem value="custom">Custom range</SelectItem>
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
                From {format(date, "MMM d")}
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
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Notes</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
          </div>
          <div>
            {sessions.map((session) => (
              <div key={session.id} className="grid grid-cols-12 px-4 py-4 border-b items-center">
                <div className="col-span-2 text-sm">{format(session.date, "MMM d, yyyy")}</div>
                <div className="col-span-3 flex items-center">
                  <div className={`w-2 h-2 rounded-full bg-${session.color}-500 mr-2`}></div>
                  <span>{session.activity}</span>
                </div>
                <div className="col-span-2 text-sm">{session.duration}</div>
                <div className="col-span-2 text-sm">{session.timeRange}</div>
                <div className="col-span-2 text-sm text-muted-foreground">{session.notes}</div>
                <div className="col-span-1 flex justify-end">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H3.5C3.22386 4 3 3.77614 3 3.5ZM0 5.5C0 5.22386 0.223858 5 0.5 5H14.5C14.7761 5 15 5.22386 15 5.5C15 5.77614 14.7761 6 14.5 6H0.5C0.223858 6 0 5.77614 0 5.5ZM2 8.5C2 8.22386 2.22386 8 2.5 8H12.5C12.7761 8 13 8.22386 13 8.5C13 8.77614 12.7761 9 12.5 9H2.5C2.22386 9 2 8.77614 2 8.5ZM3 11.5C3 11.2239 3.22386 11 3.5 11H11.5C11.7761 11 12 11.2239 12 11.5C12 11.7761 11.7761 12 11.5 12H3.5C3.22386 12 3 11.7761 3 11.5ZM4 14.5C4 14.2239 4.22386 14 4.5 14H10.5C10.7761 14 11 14.2239 11 14.5C11 14.7761 10.7761 15 10.5 15H4.5C4.22386 15 4 14.7761 4 14.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="w-full text-center text-sm text-muted-foreground mt-4">
        A list of your recent coding sessions
      </div>
    </div>
  )
}
