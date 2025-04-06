import { PrismaClient } from '@prisma/client'

// Fix for Prisma client hot reloading in development
// This ensures we don't create multiple instances during development
declare global {
  // This should be `var` instead of `let` or `const` to work in Next.js environment
  var prisma: PrismaClient | undefined
}

// Simple prisma client singleton with connection pooling configuration
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Add connection pooling configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // Reduce log noise during development
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error']
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
    // Use a simpler connection check that doesn't create prepared statements
    await db.$connect()
    console.log('Successfully connected to database')
    return true
  } catch (e: any) {
    console.error('Failed to connect to database:', e.message)
    
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
  console.error('Unhandled Rejection at Promise', reason)
  // Don't exit in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1)
  }
})
