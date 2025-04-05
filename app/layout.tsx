import Provider from '@/app/provider'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import AuthWrapper from '@/components/wrapper/auth-wrapper'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/contexts/app-context'

export const metadata: Metadata = {
  metadataBase: new URL("https://nexevo.io"),
  title: {
    default: 'CodeTrack',
    template: `%s | CodeTrack`
  },
  description: 'CodeTrack by Nexevo - The intelligent time tracking solution for developers. Monitor coding sessions, manage projects and courses, and gain insights into your development productivity.',
  openGraph: {
    description: 'CodeTrack by Nexevo - The intelligent time tracking solution for developers. Monitor coding sessions, manage projects and courses, and gain insights into your development productivity.',
    images: ['https://utfs.io/f/8a428f85-ae83-4ca7-9237-6f8b65411293-eun6ii.png'],
    url: 'https://nexevo.io/'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeTrack by Nexevo',
    description: 'CodeTrack by Nexevo - The intelligent time tracking solution for developers. Monitor coding sessions, manage projects and courses, and gain insights into your development productivity.',
    siteId: "",
    creator: "@nexevo",
    creatorId: "",
    images: ['https://utfs.io/f/8a428f85-ae83-4ca7-9237-6f8b65411293-eun6ii.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link
            rel="preload"
            href="https://utfs.io/f/31dba2ff-6c3b-4927-99cd-b928eaa54d5f-5w20ij.png"
            as="image"
          />
          <link
            rel="preload"
            href="https://utfs.io/f/69a12ab1-4d57-4913-90f9-38c6aca6c373-1txg2.png"
            as="image"
          />
        </head>
        <body 
          className={GeistSans.className}
          style={{ overscrollBehaviorX: "auto" }}
        >
          <Provider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AppProvider>
                {children}
                <Toaster />
              </AppProvider>
            </ThemeProvider>
          </Provider>
        </body>
      </html>
    </AuthWrapper>
  )
}