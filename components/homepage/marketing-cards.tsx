"use client"
import { TITLE_TAILWIND_CLASS } from '@/utils/constants'
import { motion } from 'framer-motion'
import { Clock, BarChart2, Calendar, Book, Briefcase, Timer, PieChart, Bell } from 'lucide-react'

const Features = [
  {
    id: 1,
    name: 'Smart Time Tracking',
    description: 'Automatically detect and track your active coding time with intelligent session management.',
    icon: Clock
  },
  {
    id: 2,
    name: 'Project Management',
    description: 'Organize and track time for different projects, keeping your professional work properly managed.',
    icon: Briefcase
  },
  {
    id: 3,
    name: 'Course Tracking',
    description: 'Monitor time spent on learning and educational activities with dedicated course tracking.',
    icon: Book
  },
  {
    id: 4,
    name: 'Real-time Timer',
    description: 'Start, pause, and log your coding sessions with an intuitive timer interface.',
    icon: Timer
  },
  {
    id: 5,
    name: 'Activity Calendar',
    description: 'View your coding activity patterns with a detailed calendar visualization.',
    icon: Calendar
  },
  {
    id: 6,
    name: 'Analytics Dashboard',
    description: 'Comprehensive analytics to understand your coding habits and productivity trends.',
    icon: BarChart2
  }
]

const SpringAnimatedFeatures = () => {
  return (
    <div className="flex flex-col justify-center items-center lg:w-[75%]">
      <div className='flex flex-col mb-[3rem]'>
        <h2 className={`${TITLE_TAILWIND_CLASS} mt-2 font-semibold tracking-tight dark:text-white text-gray-900 text-center`}>
          CodeTrack Features
        </h2>
        <p className="mx-auto max-w-[500px] text-gray-600 dark:text-gray-400 text-center mt-2">
          Everything you need to track and improve your development productivity
        </p>
      </div>
      <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Features.map((feature) => {
          const Icon = feature.icon
          return (
            <motion.div
              whileHover={{
                y: -8,
              }}
              transition={{
                type: 'spring',
                bounce: 0.7,
              }}
              key={feature.id}
              className="mt-5 text-left border p-6 rounded-md dark:bg-black"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-blue-500" />
                  <div className="font-medium">{feature.name}</div>
                </div>
                <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                  {feature.description}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default SpringAnimatedFeatures
