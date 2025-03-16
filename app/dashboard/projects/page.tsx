"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, MoreHorizontal, Clock, Layers } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type Project = {
  id: number
  title: string
  description: string
  totalActivities: number
  totalTime: string
  color: string
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectColor, setNewProjectColor] = useState('blue')

  // Dummy projects data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: 'Personal Portfolio',
      description: 'Building a responsive portfolio website using React and Tailwind CSS',
      totalActivities: 4,
      totalTime: '18h 45m',
      color: 'blue'
    },
    {
      id: 2,
      title: 'E-commerce App',
      description: 'Full-stack e-commerce application with Next.js and Supabase',
      totalActivities: 6,
      totalTime: '32h 20m',
      color: 'purple'
    },
    {
      id: 3,
      title: 'Mobile Weather App',
      description: 'React Native weather application with API integration',
      totalActivities: 3,
      totalTime: '8h 15m',
      color: 'teal'
    }
  ])

  const colorOptions = [
    { name: 'Red', value: 'red' },
    { name: 'Green', value: 'green' },
    { name: 'Blue', value: 'blue' },
    { name: 'Yellow', value: 'yellow' },
    { name: 'Purple', value: 'purple' },
    { name: 'Teal', value: 'teal' }
  ]

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddProject = () => {
    if (!newProjectTitle.trim()) return

    const newProject: Project = {
      id: projects.length + 1,
      title: newProjectTitle,
      description: newProjectDescription,
      totalActivities: 0,
      totalTime: '0h 0m',
      color: newProjectColor
    }

    setProjects([...projects, newProject])
    setNewProjectTitle('')
    setNewProjectDescription('')
    setNewProjectColor('blue')
    setIsAddProjectOpen(false)
  }

  return (
    <div className="flex flex-col p-4 gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
                <DialogDescription>
                  Create a new project to track your development work.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Project title"
                    className="col-span-3"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Project description"
                    className="col-span-3"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right">
                    Color
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    {colorOptions.map((color) => (
                      <div
                        key={color.value}
                        className={cn(
                          "w-8 h-8 rounded-full cursor-pointer border-2",
                          newProjectColor === color.value ? "border-black dark:border-white" : "border-transparent"
                        )}
                        style={{ backgroundColor: `var(--${color.value})` }}
                        onClick={() => setNewProjectColor(color.value)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddProjectOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProject}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className={`w-full h-2 bg-${project.color}-500`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Add Activity</DropdownMenuItem>
                      <DropdownMenuItem>Edit Project</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {project.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 text-muted-foreground text-sm border-t">
                <div className="flex items-center">
                  <Layers className="h-4 w-4 mr-1" />
                  {project.totalActivities} Activities
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {project.totalTime}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed h-[60vh]">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-semibold mb-2">No projects found</h2>
            {searchQuery ? (
              <p className="text-sm text-muted-foreground mb-4">
                No projects match your search criteria
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't created any projects yet
                </p>
                <Button onClick={() => setIsAddProjectOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
