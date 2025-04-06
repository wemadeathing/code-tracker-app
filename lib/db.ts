import { PrismaClient } from '@prisma/client'

// Fix for Prisma client hot reloading in development
// This ensures we don't create multiple instances during development
declare global {
  // This should be `var` instead of `let` or `const` to work in Next.js environment
  var prisma: PrismaClient | undefined
}

// Production-optimized Prisma client configuration
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // Production-optimized logging
    log: process.env.NODE_ENV === 'production' 
      ? ['error'] // Only log errors in production
      : ['query', 'error', 'warn']
  })
}

// Use global variable to keep Prisma client instance across hot reloads
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const db = globalForPrisma.prisma ?? prismaClientSingleton()

// Set the global prisma in development only
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Export a function to explicitly connect when needed
export async function connectToDatabase() {
  try {
    // Log the environment and connection URL (without sensitive data)
    const dbUrl = process.env.DATABASE_URL || 'not set'
    const directUrl = process.env.DIRECT_URL || 'not set'
    
    console.log('Database connection attempt:', {
      environment: process.env.NODE_ENV,
      dbUrlProvided: !!process.env.DATABASE_URL,
      directUrlProvided: !!process.env.DIRECT_URL,
      dbUrlProtocol: dbUrl.split('://')[0],
      directUrlProtocol: directUrl.split('://')[0],
      pooling: process.env.DATABASE_URL?.includes('pool_timeout'),
      ssl: process.env.DATABASE_URL?.includes('sslmode')
    })

    // Connection with retry logic
    let retries = 3
    let lastError = null

    while (retries > 0) {
      try {
        await db.$connect()
        console.log('Successfully connected to database')
        return true
      } catch (error) {
        lastError = error
        retries--
        if (retries > 0) {
          console.log(`Retrying database connection, ${retries} attempts remaining`)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second between retries
        }
      }
    }

    // If we get here, all retries failed
    throw lastError
  } catch (e: any) {
    // Enhanced error logging for production debugging
    console.error('Database connection error details:', {
      message: e.message,
      code: e.code,
      clientVersion: e.clientVersion,
      meta: e.meta,
      // Include connection details in error (sanitized)
      connectionInfo: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        environment: process.env.NODE_ENV,
        // Add connection parameter checks
        hasPooling: process.env.DATABASE_URL?.includes('pool_timeout') || false,
        sslMode: process.env.DATABASE_URL?.includes('sslmode=') 
          ? process.env.DATABASE_URL.split('sslmode=')[1].split('&')[0] 
          : 'not specified'
      }
    })
    
    // In production, log the error but don't throw
    if (process.env.NODE_ENV === 'production') {
      console.warn('Continuing without confirmed database connection')
      return true
    }
    
    throw e
  }
}

// Disconnect on app shutdown
process.on('beforeExit', async () => {
  await db.$disconnect()
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection at Promise:', {
    reason: reason instanceof Error ? {
      message: reason.message,
      stack: process.env.NODE_ENV === 'development' ? reason.stack : undefined,
      // Add connection state
      connectionState: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        environment: process.env.NODE_ENV,
        hasPooling: process.env.DATABASE_URL?.includes('pool_timeout') || false,
        hasSsl: process.env.DATABASE_URL?.includes('sslmode') || false
      }
    } : reason
  })
  // Don't exit in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1)
  }
})
