"use client"

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, MoreHorizontal, Clock, Folder, Play, History } from 'lucide-react'
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
import { TimerDialog } from '@/components/timer-dialog'
import { LogTimeDialog } from '@/components/log-time-dialog'
import { useAppContext, ActivityType } from '@/contexts/app-context'
import { useRouter } from 'next/navigation'

export default function ActivitiesPage() {
  const { 
    courses, 
    projects, 
    activities, 
    addActivity, 
    updateActivity, 
    deleteActivity,
    addTimeToActivity,
    formatTimeFromSeconds
  } = useAppContext()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('all')
  
  const [newActivityTitle, setNewActivityTitle] = useState('')
  const [newActivityDescription, setNewActivityDescription] = useState('')
  const [newActivityParent, setNewActivityParent] = useState<string>('')
  
  // Timer state
  const [isTimerOpen, setIsTimerOpen] = useState(false)
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false)
  const [currentActivity, setCurrentActivity] = useState<ActivityType | null>(null)
  const router = useRouter()

  // Combine courses and projects for the parent selector
  const parentItems = useMemo(() => {
    const courseItems = courses.map(course => ({
      id: course.id,
      title: course.title,
      type: 'course' as const,
      color: course.color
    }));
    
    const projectItems = projects.map(project => ({
      id: project.id,
      title: project.title,
      type: 'project' as const,
      color: project.color
    }));
    
    return [...courseItems, ...projectItems];
  }, [courses, projects]);

  // Filter activities based on search and tab
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.parentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'courses') return matchesSearch && activity.parentType === 'course';
    if (activeTab === 'projects') return matchesSearch && activity.parentType === 'project';
    
    return matchesSearch;
  });

  // Handler for adding a new activity
  const handleAddActivity = () => {
    if (!newActivityTitle.trim() || !newActivityParent) return;
    
    const [parentType, parentIdStr] = newActivityParent.split('-');
    const parentId = parseInt(parentIdStr, 10);
    
    let parentTitle = '';
    let parentColor = '';
    
    if (parentType === 'course') {
      const course = courses.find(c => c.id === parentId);
      if (course) {
        parentTitle = course.title;
        parentColor = course.color;
      }
    } else if (parentType === 'project') {
      const project = projects.find(p => p.id === parentId);
      if (project) {
        parentTitle = project.title;
        parentColor = project.color;
      }
    }
    
    addActivity({
      title: newActivityTitle,
      description: newActivityDescription,
      parentType: parentType as 'course' | 'project',
      parentId,
      parentTitle,
      parentColor,
      totalTime: '0h 0m',
      totalSeconds: 0,
      sessions: []
    });
    
    setNewActivityTitle('');
    setNewActivityDescription('');
    setNewActivityParent('');
    setIsAddActivityOpen(false);
  };

  // Handler for deleting an activity
  const handleDeleteActivity = (id: number) => {
    deleteActivity(id);
  };

  // Handler for starting the timer
  const handleStartTimer = (activity: ActivityType) => {
    setCurrentActivity(activity)
    setIsTimerOpen(true)
  }

  // Handler for logging past time
  const handleLogPastTime = (activity: ActivityType) => {
    setCurrentActivity(activity)
    setIsLogTimeOpen(true)
  }

  // Handler for saving time from the timer
  const handleSaveTime = (seconds: number, notes: string) => {
    if (currentActivity) {
      addTimeToActivity(currentActivity.id, seconds, notes)
      setIsTimerOpen(false)
      setCurrentActivity(null)
    }
  }

  // Handler for saving logged time
  const handleSaveLoggedTime = (seconds: number, notes: string) => {
    if (currentActivity) {
      addTimeToActivity(currentActivity.id, seconds, notes)
      setIsLogTimeOpen(false)
      setCurrentActivity(null)
    }
  }

  // Handler for redirecting to sessions
  const navigateToSessions = () => {
    router.push('/dashboard/sessions')
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
              aria-label="Search activities"
            />
          </div>
          <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
            <DialogTrigger asChild>
              <Button aria-label="Add new activity">
                <Plus className="mr-2 h-4 w-4" />
                New Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Activity</DialogTitle>
                <DialogDescription>
                  Create a new activity to track your progress.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                    placeholder="Activity description"
                    className="col-span-3"
                    value={newActivityDescription}
                    onChange={(e) => setNewActivityDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent" className="text-right">
                    Parent
                  </Label>
                  <Select
                    value={newActivityParent}
                    onValueChange={setNewActivityParent}
                  >
                    <SelectTrigger id="parent" className="col-span-3">
                      <SelectValue placeholder="Select a course or project" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="mb-2">
                        <p className="px-2 text-sm font-medium">Courses</p>
                      </div>
                      {parentItems
                        .filter(item => item.type === 'course')
                        .map(course => (
                          <SelectItem key={`course-${course.id}`} value={`course-${course.id}`}>
                            {course.title}
                          </SelectItem>
                        ))
                      }
                      <div className="mb-2 mt-3">
                        <p className="px-2 text-sm font-medium">Projects</p>
                      </div>
                      {parentItems
                        .filter(item => item.type === 'project')
                        .map(project => (
                          <SelectItem key={`project-${project.id}`} value={`project-${project.id}`}>
                            {project.title}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddActivityOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddActivity}
                  disabled={!newActivityTitle.trim() || !newActivityParent}
                >
                  Create Activity
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="courses">Course Activities</TabsTrigger>
          <TabsTrigger value="projects">Project Activities</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="overflow-hidden">
              <div 
                className="w-full h-2" 
                style={{ backgroundColor: `hsl(var(--${activity.parentColor}))` }}
                aria-hidden="true"
              />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{activity.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Activity actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleStartTimer(activity)}>
                        Start Timer
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleLogPastTime(activity)}>
                        Log Past Time
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={navigateToSessions}>View Sessions</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => {}}>Edit Activity</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onSelect={() => handleDeleteActivity(activity.id)}
                      >
                        Delete Activity
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.description}
                  </p>
                </div>
                <div className="flex items-center">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "flex items-center gap-1",
                      activity.parentColor && `border-${activity.parentColor} text-${activity.parentColor}`
                    )}
                  >
                    <Folder className="h-3 w-3" />
                    <span>{activity.parentTitle}</span>
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex flex-col gap-3">
                <div className="flex justify-between w-full text-muted-foreground text-sm">
                  <span>Sessions: {activity.sessions.length}</span>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{activity.totalTime || '0h 0m'}</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="default" 
                    className="w-full" 
                    size="sm"
                    onClick={() => handleStartTimer(activity)}
                  >
                    <Play className="h-4 w-4 mr-1" /> Start Timer
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => handleLogPastTime(activity)}
                  >
                    <History className="h-4 w-4 mr-1" /> Log Time
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed h-[60vh]">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-semibold mb-2">No activities found</h2>
            {searchQuery ? (
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

      {/* Timer Dialog */}
      {currentActivity && (
        <>
          <TimerDialog
            isOpen={isTimerOpen}
            onClose={() => {
              setIsTimerOpen(false);
              setCurrentActivity(null);
            }}
            activity={currentActivity}
            onSaveTime={handleSaveTime}
          />
          
          <LogTimeDialog
            isOpen={isLogTimeOpen}
            onClose={() => {
              setIsLogTimeOpen(false);
              setCurrentActivity(null);
            }}
            activity={currentActivity}
            onSaveTime={handleSaveLoggedTime}
          />
        </>
      )}
    </div>
  )
}
