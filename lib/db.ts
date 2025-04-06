import { PrismaClient } from '@prisma/client'

// Fix for Prisma client hot reloading in development
// This ensures we don't create multiple instances during development
declare global {
  // This should be `var` instead of `let` or `const` to work in Next.js environment
  var prisma: PrismaClient | undefined
}

// Simple prisma client singleton with minimal configuration to reduce issues
const prismaClientSingleton = () => {
  return new PrismaClient()
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
    // Basic connection check
    await db.$queryRaw`SELECT 1`
    console.log('Successfully connected to database')
    return true
  } catch (e: any) {
    console.error('Failed to connect to database:', e.message)
    
    // In production, log the error but don't throw
    if (process.env.NODE_ENV === 'production') {
      console.warn('Continuing without confirmed database connection')
      return true // Return true to allow the app to continue
    }
    
    throw e
  }
}

// Try to disconnect when the app is shutting down
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
