"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, MoreHorizontal, Clock, Folder } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Activity = {
  id: number
  title: string
  description: string
  parentType: 'course' | 'project'
  parentId: number
  parentTitle: string
  parentColor: string
  totalTime: string
}

type ParentItem = {
  id: number
  title: string
  type: 'course' | 'project'
  color: string
}

export default function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('all')
  
  const [newActivityTitle, setNewActivityTitle] = useState('')
  const [newActivityDescription, setNewActivityDescription] = useState('')
  const [newActivityParent, setNewActivityParent] = useState<string>('')

  // Dummy parent items (courses and projects)
  const parentItems: ParentItem[] = [
    { id: 1, title: 'Learn Python', type: 'course', color: 'green' },
    { id: 2, title: 'Advanced JavaScript', type: 'course', color: 'yellow' },
    { id: 3, title: 'Web Development Bootcamp', type: 'course', color: 'blue' },
    { id: 4, title: 'Personal Portfolio', type: 'project', color: 'blue' },
    { id: 5, title: 'E-commerce App', type: 'project', color: 'purple' },
    { id: 6, title: 'Mobile Weather App', type: 'project', color: 'teal' }
  ]

  // Dummy activities data
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 1,
      title: 'Data Structures',
      description: 'Learn about arrays, linked lists, trees and graphs',
      parentType: 'course',
      parentId: 1,
      parentTitle: 'Learn Python',
      parentColor: 'green',
      totalTime: '8h 15m'
    },
    {
      id: 2,
      title: 'Algorithms',
      description: 'Sorting, searching and other common algorithms',
      parentType: 'course',
      parentId: 1,
      parentTitle: 'Learn Python',
      parentColor: 'green',
      totalTime: '6h 30m'
    },
    {
      id: 3,
      title: 'Promises & Async/Await',
      description: 'Deep dive into JavaScript asynchronous patterns',
      parentType: 'course',
      parentId: 2,
      parentTitle: 'Advanced JavaScript',
      parentColor: 'yellow',
      totalTime: '4h 45m'
    },
    {
      id: 4,
      title: 'API Integration',
      description: 'Connecting to weather APIs and parsing responses',
      parentType: 'project',
      parentId: 6,
      parentTitle: 'Mobile Weather App',
      parentColor: 'teal',
      totalTime: '3h 20m'
    },
    {
      id: 5,
      title: 'UI Components',
      description: 'Building reusable UI components for the app',
      parentType: 'project',
      parentId: 5,
      parentTitle: 'E-commerce App',
      parentColor: 'purple',
      totalTime: '10h 45m'
    }
  ])

  const filteredActivities = activities
    .filter(activity => 
      (activeTab === 'all' || 
       (activeTab === 'courses' && activity.parentType === 'course') ||
       (activeTab === 'projects' && activity.parentType === 'project'))
    )
    .filter(activity =>
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.parentTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleAddActivity = () => {
    if (!newActivityTitle.trim() || !newActivityParent) return

    const parentItem = parentItems.find(item => `${item.type}-${item.id}` === newActivityParent)
    
    if (!parentItem) return

    const newActivity: Activity = {
      id: activities.length + 1,
      title: newActivityTitle,
      description: newActivityDescription,
      parentType: parentItem.type,
      parentId: parentItem.id,
      parentTitle: parentItem.title,
      parentColor: parentItem.color,
      totalTime: '0h 0m'
    }

    setActivities([...activities, newActivity])
    setNewActivityTitle('')
    setNewActivityDescription('')
    setNewActivityParent('')
    setIsAddActivityOpen(false)
  }

  return (
    <div className="flex flex-col p-4 gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Activities</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search activities..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Activity</DialogTitle>
                <DialogDescription>
                  Create a new activity within a course or project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent" className="text-right">
                    Course/Project
                  </Label>
                  <Select 
                    value={newActivityParent} 
                    onValueChange={setNewActivityParent}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a course or project" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1.5 text-sm font-semibold">Courses</div>
                      {parentItems
                        .filter(item => item.type === 'course')
                        .map(course => (
                          <SelectItem key={`course-${course.id}`} value={`course-${course.id}`}>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full bg-${course.color}-500 mr-2`}></div>
                              {course.title}
                            </div>
                          </SelectItem>
                        ))
                      }
                      <div className="px-2 py-1.5 text-sm font-semibold">Projects</div>
                      {parentItems
                        .filter(item => item.type === 'project')
                        .map(project => (
                          <SelectItem key={`project-${project.id}`} value={`project-${project.id}`}>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full bg-${project.color}-500 mr-2`}></div>
                              {project.title}
                            </div>
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Activity title"
                    className="col-span-3"
                    value={newActivityTitle}
                    onChange={(e) => setNewActivityTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Activity description"
                    className="col-span-3"
                    value={newActivityDescription}
                    onChange={(e) => setNewActivityDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddActivityOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddActivity}>Create Activity</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="courses">Course Activities</TabsTrigger>
          <TabsTrigger value="projects">Project Activities</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="overflow-hidden">
              <div className={`w-full h-2 bg-${activity.parentColor}-500`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{activity.title}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`mt-2 text-${activity.parentColor}-600 bg-${activity.parentColor}-50 border-${activity.parentColor}-200`}
                    >
                      {activity.parentTitle}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Start Timer</DropdownMenuItem>
                      <DropdownMenuItem>Edit Activity</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete Activity
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {activity.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 text-muted-foreground text-sm border-t">
                <div className="flex items-center">
                  <Folder className="h-4 w-4 mr-1" />
                  {activity.parentType === 'course' ? 'Course' : 'Project'}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {activity.totalTime}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed h-[60vh]">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-semibold mb-2">No activities found</h2>
            {searchQuery || activeTab !== 'all' ? (
              <p className="text-sm text-muted-foreground mb-4">
                No activities match your search criteria
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't created any activities yet
                </p>
                <Button onClick={() => setIsAddActivityOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Activity
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
