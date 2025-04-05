"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, MoreHorizontal, BookOpen, Clock, Play, List } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAppContext, CourseType } from '@/contexts/app-context'
import { useRouter } from 'next/navigation'

export default function CoursesPage() {
  const { 
    courses, 
    addCourse, 
    updateCourse, 
    deleteCourse,
    activities
  } = useAppContext()

  const [searchQuery, setSearchQuery] = useState('')
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false)
  const [newCourseTitle, setNewCourseTitle] = useState('')
  const [newCourseDescription, setNewCourseDescription] = useState('')
  const [newCourseColor, setNewCourseColor] = useState('blue')
  const router = useRouter()

  const colorOptions = [
    { name: 'Red', value: 'red' },
    { name: 'Green', value: 'green' },
    { name: 'Blue', value: 'blue' },
    { name: 'Yellow', value: 'yellow' },
    { name: 'Purple', value: 'purple' },
    { name: 'Teal', value: 'teal' }
  ]

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddCourse = () => {
    if (!newCourseTitle.trim()) return

    addCourse({
      title: newCourseTitle,
      description: newCourseDescription,
      color: newCourseColor
    })

    setNewCourseTitle('')
    setNewCourseDescription('')
    setNewCourseColor('blue')
    setIsAddCourseOpen(false)
  }

  const handleDeleteCourse = (id: number) => {
    deleteCourse(id)
  }

  // Calculate course stats
  const getCourseStats = (courseId: number) => {
    const courseActivities = activities.filter(
      activity => activity.parentType === 'course' && activity.parentId === courseId
    )
    
    const totalTimeSeconds = courseActivities.reduce(
      (total, activity) => total + (activity.totalSeconds || 0), 0
    )
    
    return {
      activitiesCount: courseActivities.length,
      totalTime: courseActivities.length ? totalTimeSeconds : 0
    }
  }

  // Navigate to activities page filtered by this course
  const viewCourseActivities = (course: CourseType) => {
    router.push(`/dashboard/activities?parent=course-${course.id}&parentType=course`)
  }

  // Navigate to add activity page with this course pre-selected
  const addActivityToCourse = (course: CourseType) => {
    router.push(`/dashboard/activities?new=1&parent=course-${course.id}&parentType=course`)
  }
  
  // Start timer for the first activity in this course
  const startCourseActivity = (course: CourseType) => {
    const courseActivities = activities.filter(
      activity => activity.parentType === 'course' && activity.parentId === course.id
    )
    
    if (courseActivities.length > 0) {
      // Navigate to timer page with the first activity
      router.push(`/dashboard/timer?activity=${courseActivities[0].id}`)
    } else {
      // If no activities, redirect to create a new one
      addActivityToCourse(course)
    }
  }

  // Helper to format time display
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  return (
    <div className="flex flex-col p-4 gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Courses</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search courses"
            />
          </div>
          <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
            <DialogTrigger asChild>
              <Button aria-label="Add new course">
                <Plus className="mr-2 h-4 w-4" />
                New Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>
                  Create a new course to track your learning progress.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Course title"
                    className="col-span-3"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Course description"
                    className="col-span-3"
                    value={newCourseDescription}
                    onChange={(e) => setNewCourseDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color-selection" className="text-right">
                    Color
                  </Label>
                  <div id="color-selection" className="col-span-3 flex gap-2" role="radiogroup" aria-labelledby="color-selection-label">
                    {colorOptions.map((color) => (
                      <div
                        key={color.value}
                        className={cn(
                          "w-8 h-8 rounded-full cursor-pointer border-2",
                          newCourseColor === color.value ? "border-black dark:border-white" : "border-transparent"
                        )}
                        style={{ backgroundColor: `hsl(var(--${color.value}))` }}
                        onClick={() => setNewCourseColor(color.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setNewCourseColor(color.value);
                          }
                        }}
                        tabIndex={0}
                        role="radio"
                        aria-checked={newCourseColor === color.value}
                        aria-label={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddCourse}
                  disabled={!newCourseTitle.trim()}
                >
                  Create Course
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => {
            const stats = getCourseStats(course.id)
            return (
              <Card key={course.id} className="overflow-hidden flex flex-col h-[320px]">
                <div 
                  className="w-full h-2" 
                  style={{ backgroundColor: `hsl(var(--${course.color}))` }}
                  aria-hidden="true"
                />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Course actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => viewCourseActivities(course)}>
                          View Activities
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => addActivityToCourse(course)}>
                          Add Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {}}>Edit Course</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onSelect={() => handleDeleteCourse(course.id)}
                        >
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {course.description}
                  </p>
                </CardContent>
                <CardFooter className="border-t pt-4 flex flex-col gap-3">
                  <div className="flex justify-between w-full text-muted-foreground text-sm">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{stats.activitiesCount} Activities</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatTime(stats.totalTime)}</span>
                    </div>
                  </div>
                  {stats.activitiesCount > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                      <Button 
                        variant="default" 
                        className="h-9 flex items-center justify-center gap-2" 
                        onClick={() => startCourseActivity(course)}
                      >
                        <Play className="h-5 w-5" /> Start
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-9 flex items-center justify-center gap-2" 
                        onClick={() => viewCourseActivities(course)}
                      >
                        <List className="h-5 w-5" /> Activities
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="default" 
                      className="w-full h-9 flex items-center justify-center gap-2" 
                      onClick={() => addActivityToCourse(course)}
                    >
                      <Plus className="h-5 w-5" /> Add First Activity
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed h-[60vh]">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-semibold mb-2">No courses found</h2>
            {searchQuery ? (
              <p className="text-sm text-muted-foreground mb-4">
                No courses match your search criteria
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't created any courses yet
                </p>
                <Button onClick={() => setIsAddCourseOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Course
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
