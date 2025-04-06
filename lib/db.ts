import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

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
  try {
    await prisma.$connect()
    console.log('Successfully connected to database')
    return true
  } catch (e) {
    console.error('Failed to connect to database:', e)
    throw e
  }
}

// Graceful shutdown
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
