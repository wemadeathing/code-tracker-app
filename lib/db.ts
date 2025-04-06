import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Keep track of connection attempts to prevent infinite retry loops
let connectionAttempts = 0
const MAX_CONNECTION_ATTEMPTS = 3

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty',
  })
}

// Check if we already have a Prisma instance in global scope
const prisma = globalThis.prisma ?? prismaClientSingleton()

export { prisma as db }

// Only do this in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Export a function to explicitly connect when needed
export async function connectToDatabase() {
  if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
    console.warn('Maximum database connection attempts reached, continuing without confirmed connection')
    return true // Return true to allow the app to continue
  }
  
  connectionAttempts++
  
  try {
    await prisma.$connect()
    console.log('Successfully connected to database')
    connectionAttempts = 0 // Reset counter on success
    return true
  } catch (e: any) {
    console.error('Failed to connect to database:', e.message)
    
    // In production, don't throw the error - just log it and continue
    if (process.env.NODE_ENV === 'production') {
      console.warn('Continuing without database connection in production')
      return true // Return true to allow the app to continue
    }
    
    throw e
  }
}

// Graceful shutdown
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
