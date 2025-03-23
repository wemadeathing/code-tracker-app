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
import { toast } from '@/components/ui/use-toast'

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

  // Use activity.color as fallback if parentColor is not available
  const cardColor = activity.parentColor || activity.color;

  return (
    <Card className="overflow-hidden flex flex-col h-[320px]">
      <div 
        className="w-full h-2" 
        style={{ backgroundColor: `hsl(var(--${cardColor}))` }}
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
              cardColor && `border-${cardColor} text-${cardColor}`
            )}
          >
            <Folder className="h-3 w-3" />
            <span>{activity.parentTitle}</span>
          </Badge>
        </div>
      </CardContent>
      
     <CardFooter className="border-t pt-4 flex flex-col gap-3">
       <div className="flex justify-between w-full text-muted-foreground text-sm">
         <span>Sessions: {activity.sessions?.length || 0}</span>
         <div className="flex items-center">
           <Clock className="h-4 w-4 mr-1" />
           <span>{formatTime(activity.totalSeconds || 0)}</span>
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
  const [isDeleting, setIsDeleting] = useState(false)
  
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
    // First, filter out any activities that might be in a deleted state
    const validActivities = activities.filter(activity => activity && activity.id);
    
    const result = validActivities.filter(activity => {
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
      color: parentColor, // Add this line to ensure color is saved to the database
      totalTime: '0h 0m',
      totalSeconds: 0,
      sessions: []
    });
    
    toast({
      title: "Success",
      description: "Activity created successfully.",
    });
    
    setNewActivityTitle('');
    setNewActivityDescription('');
    setNewActivityParent('');
    setIsAddActivityOpen(false);
  };

  // Handler for deleting an activity
  const handleDeleteActivity = async (id: number) => {
    try {
      setIsDeleting(true);
      
      // First, check if the activity exists in our local state
      const activityExists = activities.some(activity => activity.id === id);
      
      if (!activityExists) {
        toast({
          title: "Error",
          description: "Activity not found. It may have been already deleted.",
          variant: "destructive"
        });
        return;
      }
      
      // If it exists, try to delete it
      await deleteActivity(id);
      
      toast({
        title: "Success",
        description: "Activity deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Error",
        description: "Failed to delete activity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
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
                  disabled={!newActivityTitle.trim() || !newActivityParent || newActivityParent === 'none'}
                >
                  Add Activity
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          {/* Dynamic tabs for specific courses/projects could be added here */}
        </TabsList>
        <TabsContent value={activeTab} className="mt-0">
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
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-lg">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                  {activeTab === 'courses' ? (
                    <Folder className="h-10 w-10 text-muted-foreground" />
                  ) : activeTab === 'projects' ? (
                    <Folder className="h-10 w-10 text-muted-foreground" />
                  ) : (
                    <Clock className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">No activities found</h3>
                <p className="text-center text-muted-foreground max-w-md mb-6">
                  {searchQuery ? (
                    "No activities match your search criteria. Try adjusting your search terms."
                  ) : activeTab !== 'all' ? (
                    `You don't have any activities in this category yet. Create one to get started.`
                  ) : (
                    "You haven't created any activities yet. Activities help you track time spent on specific tasks."
                  )}
                </p>
                <Button 
                  onClick={() => {
                    // If it's a specific parent, pre-select it in the dialog
                    if (activeTab.startsWith('course-') || activeTab.startsWith('project-')) {
                      setNewActivityParent(activeTab);
                    }
                    setIsAddActivityOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {searchQuery ? "Create New Activity" : "Create Your First Activity"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
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