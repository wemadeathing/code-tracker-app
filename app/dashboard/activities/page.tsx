"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, MoreHorizontal, Clock, Folder, Play, History } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TimerDialog } from '@/components/timer-dialog'
import { LogTimeDialog } from '@/components/log-time-dialog'
import { useAppContext, ActivityType } from '@/contexts/app-context'
import { useRouter, useSearchParams } from 'next/navigation'

// Activity Card Component
interface ActivityCardProps {
  activity: ActivityType;
  onStartTimer: (activity: ActivityType) => void;
  onLogPastTime: (activity: ActivityType) => void;
  onViewSessions: () => void;
  onDelete: (id: number) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  onStartTimer, 
  onLogPastTime, 
  onViewSessions, 
  onDelete 
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  return (
    <Card className="overflow-hidden flex flex-col h-[320px]">
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
              <DropdownMenuItem onSelect={() => onStartTimer(activity)}>
                Start Timer
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onLogPastTime(activity)}>
                Log Past Time
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onViewSessions}>View Sessions</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>Edit Activity</DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onSelect={() => onDelete(activity.id)}
              >
                Delete Activity
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
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
            <span>{formatTime(activity.totalSeconds)}</span>
          </div>
        </div>
        <div className="flex gap-2 w-full">
          <Button 
            variant="default" 
            className="w-full" 
            size="sm"
            onClick={() => onStartTimer(activity)}
          >
            <Play className="h-4 w-4 mr-1" /> Start Timer
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            size="sm"
            onClick={() => onLogPastTime(activity)}
          >
            <History className="h-4 w-4 mr-1" /> Log Time
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function ActivitiesPage() {
  const { 
    courses, 
    projects,
    activities, 
    addActivity, 
    updateActivity, 
    deleteActivity,
    addTimeToActivity
  } = useAppContext()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
  const [newActivityTitle, setNewActivityTitle] = useState('')
  const [newActivityDescription, setNewActivityDescription] = useState('')
  const [newActivityParent, setNewActivityParent] = useState('')
  
  // Timer state
  const [isTimerOpen, setIsTimerOpen] = useState(false)
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false)
  const [currentActivity, setCurrentActivity] = useState<ActivityType | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for query parameters on page load
  useEffect(() => {
    // Check if we should open the add activity dialog with a pre-selected parent
    const newParam = searchParams.get('new')
    const parentParam = searchParams.get('parent')
    const parentTypeParam = searchParams.get('parentType')
    
    if (newParam === '1' && parentParam) {
      setIsAddActivityOpen(true)
      setNewActivityParent(parentParam)
    }
    
    // Handle filtered tab selection based on parent parameter
    if (parentParam) {
      setActiveTab(parentParam)
      
      // If it's a specific course or project, set it as the active tab
      if (parentParam.startsWith('course-') || parentParam.startsWith('project-')) {
        setActiveTab(parentParam)
      } else if (parentParam === 'courses' || parentParam === 'projects') {
        setActiveTab(parentParam)
      }
    }

    // Log for debugging
    console.log('URL Params:', { 
      parentParam, 
      parentTypeParam, 
      activeTab: parentParam || 'all' 
    })
  }, [searchParams])

  // Combine courses and projects for the parent selector
  const parentItems = useMemo(() => {
    const courseOptions = courses.map(course => ({
      id: `course-${course.id}`,
      title: course.title,
      type: 'course',
      color: course.color
    }))
    
    const projectOptions = projects.map(project => ({
      id: `project-${project.id}`,
      title: project.title,
      type: 'project',
      color: project.color
    }))
    
    return [...courseOptions, ...projectOptions]
  }, [courses, projects])

  // Helper to format time display
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  // Filter activities based on search and active tab
  const filteredActivities = useMemo(() => {
    const result = activities.filter(activity => {
      // Text search filter
      const matchesSearch = 
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Tab filter
      let matchesTab = activeTab === 'all'
      
      if (activeTab.startsWith('course-')) {
        const courseId = parseInt(activeTab.replace('course-', ''))
        matchesTab = activity.parentType === 'course' && activity.parentId === courseId
      } else if (activeTab.startsWith('project-')) {
        const projectId = parseInt(activeTab.replace('project-', ''))
        matchesTab = activity.parentType === 'project' && activity.parentId === projectId
      } else if (activeTab === 'courses') {
        matchesTab = activity.parentType === 'course'
      } else if (activeTab === 'projects') {
        matchesTab = activity.parentType === 'project'
      }
      
      return matchesSearch && matchesTab
    })

    console.log('Filtered Activities:', result); // Debugging log
    return result;
  }, [activities, searchQuery, activeTab])

  // Handler for adding a new activity
  const handleAddActivity = () => {
    if (!newActivityTitle.trim() || !newActivityParent || newActivityParent === 'none') return;
    
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
                    <SelectTrigger className="col-span-3" id="parent">
                      <SelectValue placeholder="Select a course or project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {parentItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.title} ({item.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddActivityOpen(false);
                  setNewActivityTitle('');
                  setNewActivityDescription('');
                  setNewActivityParent('');
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddActivity}
                  disabled={!newActivityTitle.trim()}
                >
                  Create Activity
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={activeTab === 'all' ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveTab('all')}
              className="rounded-full"
            >
              All
            </Button>
            <Button 
              variant={activeTab === 'courses' ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveTab('courses')}
              className="rounded-full"
            >
              Courses
            </Button>
            <Button 
              variant={activeTab === 'projects' ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveTab('projects')}
              className="rounded-full"
            >
              Projects
            </Button>
          </div>
          
          {/* Parent filter dropdown - moved to the right */}
          <div className="flex items-center gap-2">
            <Select
              value={activeTab.startsWith('course-') || activeTab.startsWith('project-') ? activeTab : ''}
              onValueChange={(value) => {
                if (value) setActiveTab(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by item" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Courses</SelectLabel>
                  {parentItems
                    .filter(item => item.type === 'course')
                    .map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))
                  }
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Projects</SelectLabel>
                  {parentItems
                    .filter(item => item.type === 'project')
                    .map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {/* Clear filter button - moved next to the dropdown */}
            {activeTab !== 'all' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveTab('all')}
                className="rounded-full"
              >
                Clear Filter
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Activities grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <ActivityCard 
              key={activity.id} 
              activity={activity} 
              onStartTimer={handleStartTimer}
              onLogPastTime={handleLogPastTime}
              onViewSessions={navigateToSessions}
              onDelete={handleDeleteActivity}
            />
          ))
        ) : (
          <div className="col-span-3 flex flex-1 items-center justify-center rounded-lg border border-dashed h-[60vh]">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-xl font-semibold mb-2">No activities found</h2>
              {searchQuery ? (
                <p className="text-sm text-muted-foreground mb-4">
                  No activities match your search criteria
                </p>
              ) : activeTab !== 'all' ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    No activities in this category
                  </p>
                  <Button onClick={() => {
                    // If it's a specific parent, pre-select it in the dialog
                    if (activeTab.startsWith('course-') || activeTab.startsWith('project-')) {
                      setNewActivityParent(activeTab);
                    }
                    setIsAddActivityOpen(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Activity
                  </Button>
                </>
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
