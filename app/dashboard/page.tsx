"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowUpRight, Clock, Calendar, Flame, Plus } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

export default function Dashboard() {
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState("day")

  return (
    <div className='flex flex-col justify-center items-start flex-wrap px-4 pt-4 gap-4'>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="flex flex-wrap w-full gap-4 mt-2">
        {/* Stats Cards */}
        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0m</div>
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
            <div className="text-2xl font-bold">0h</div>
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
            <div className="text-2xl font-bold">14h 0m</div>
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
            <div className="text-2xl font-bold">0 days</div>
            <p className="text-xs text-muted-foreground">
              Consecutive days coding
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Log Past Time and Start Coding Buttons */}
      <div className="flex flex-wrap gap-4 w-full justify-end">
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
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="python">Python Programming</SelectItem>
                    <SelectItem value="arabica">Arabica website</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Input
                    type="text"
                    id="date"
                    placeholder="March 16th, 2025"
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
            <Button className="w-full">Log Time</Button>
          </DialogContent>
        </Dialog>
        <Button>
          <Link href="/dashboard/timer" className="flex items-center">
            Start Coding <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Coding Activity Chart */}
      <Card className="w-full mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Coding Activity</CardTitle>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All activities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All activities</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="python">Python Programming</SelectItem>
                <SelectItem value="arabica">Arabica website</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-[3/1] min-h-[200px]">
            {/* Activity Chart */}
            <div className="w-full h-full flex items-end justify-between px-4 border-b border-l">
              <div className="flex flex-col items-center">
                <div className="w-12 bg-green-500 h-24"></div>
                <span className="text-xs mt-2">Tue</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-0"></div>
                <span className="text-xs mt-2">Wed</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-0"></div>
                <span className="text-xs mt-2">Thu</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 flex flex-col">
                  <div className="bg-teal-500 h-12"></div>
                  <div className="bg-red-500 h-20"></div>
                </div>
                <span className="text-xs mt-2">Fri</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-0"></div>
                <span className="text-xs mt-2">Sat</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-0"></div>
                <span className="text-xs mt-2">Sun</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-0"></div>
                <span className="text-xs mt-2">Mon</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 px-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500"></div>
                <span className="text-xs">Python Programming</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500"></div>
                <span className="text-xs">HTML</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-teal-500"></div>
                <span className="text-xs">Arabica website</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions and Activity Progress */}
      <div className="grid md:grid-cols-2 gap-4 w-full mt-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  <div>
                    <div className="font-medium">Arabica website</div>
                    <div className="text-xs text-muted-foreground">14/03/2025</div>
                  </div>
                </div>
                <div className="text-sm">3h 0m</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div>
                    <div className="font-medium">HTML</div>
                    <div className="text-xs text-muted-foreground">14/03/2025</div>
                  </div>
                </div>
                <div className="text-sm">6h 0m</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  <div className="font-medium">Arabica website</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm">3h 0m</div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="font-medium">HTML</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm">6h 0m</div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
