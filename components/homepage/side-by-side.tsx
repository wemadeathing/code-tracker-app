import { Clock, BarChart2, Layers } from 'lucide-react'
import { OrbitingCirclesComponent } from './orbiting-circles'
import { TITLE_TAILWIND_CLASS } from '@/utils/constants'

const features = [
  {
    name: 'Intelligent Time Tracking',
    description:
      'Automatically track your coding sessions with smart detection of active development time. Focus on coding while CodeTrack handles the time management.',
    icon: Clock,
  },
  {
    name: 'Project & Course Management',
    description: 'Organize your development activities into projects and courses. Keep your learning and professional work properly categorized and tracked.',
    icon: Layers,
  },
  {
    name: 'Insightful Analytics',
    description: 'Gain valuable insights into your coding patterns with detailed analytics. Understand your productivity trends and make data-driven improvements to your workflow.',
    icon: BarChart2,
  },
]

export default function SideBySide() {
  return (
    <div className="overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <p className={`${TITLE_TAILWIND_CLASS} mt-2 font-semibold tracking-tight dark:text-white text-gray-900`}>
                CodeTrack: Your Development Time Companion
              </p>
              <p className="mt-6 leading-8 text-gray-600 dark:text-gray-400">
                Take control of your coding time and boost your productivity with comprehensive tracking and analytics
              </p>
              <dl className="mt-10 max-w-xl space-y-8 leading-7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold dark:text-gray-100 text-gray-900">
                      <feature.icon className="absolute left-1 top-1 h-5 w-5" aria-hidden="true" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline dark:text-gray-400">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <OrbitingCirclesComponent />
        </div>
      </div>
    </div>
  )
}
