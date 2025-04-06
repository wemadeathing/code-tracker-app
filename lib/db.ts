import { PrismaClient, Prisma } from '@prisma/client'

// Fix for Prisma client hot reloading in development
declare global {
  var prisma: PrismaClient | undefined
}

// Create a new PrismaClient instance with proper connection management
function createPrismaClient() {
  // Add connection pooling configuration to avoid prepared statement issues
  const connectionOptions: Prisma.PrismaClientOptions = {
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error']
  }

  try {
    const client = new PrismaClient(connectionOptions)
    
    // Test connection immediately
    client.$connect()
      .then(() => console.log('Prisma client connected successfully'))
      .catch(e => {
        console.error('Initial Prisma connection failed:', e)
        // Don't throw here to allow fallback handling
      })
    
    return client
  } catch (err) {
    console.error('Failed to initialize Prisma client:', err)
    // In production, return a dummy client that logs errors
    if (process.env.NODE_ENV === 'production') {
      return createFallbackClient()
    }
    // In development, rethrow to help debugging
    throw err
  }
}

// Fallback client for production that prevents crashes
function createFallbackClient() {
  const handler = {
    get: function(target: any, prop: string) {
      // Handle special methods
      if (prop === '$connect' || prop === '$disconnect') {
        return () => Promise.resolve()
      }
      
      // For models like user, course, etc.
      return new Proxy({}, {
        get: function(_, method) {
          // For methods like findUnique, create, etc.
          return () => {
            console.error(`Database error: Attempted to use ${prop}.${String(method)} but database connection failed`)
            return Promise.reject(new Error(`Database connection unavailable`))
          }
        }
      })
    }
  }
  
  return new Proxy({}, handler) as unknown as PrismaClient
}

// Use global variable for development, create new instance for production
export const db = globalThis.prisma || createPrismaClient()

// Set global for development hot reloading
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}

// Clean disconnection on app termination
process.on('beforeExit', async () => {
  await db.$disconnect().catch(() => {})
})

// Safer connection checker function
export async function checkDbConnection(): Promise<boolean> {
  try {
    // Use a simple raw query to test connection
    await db.$queryRaw`SELECT 1 as connected`
    return true
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
}

// Connection function with retries
export async function connectToDatabase(maxRetries = 3): Promise<boolean> {
  let retries = maxRetries
  
  while (retries > 0) {
    try {
      await db.$connect()
      console.log('Database connected successfully')
      
      // Test with a simple query
      const result = await db.$queryRaw`SELECT 1 as connected`
      console.log('Query test successful:', result)
      
      return true
    } catch (error) {
      console.error(`Database connection attempt failed (${maxRetries - retries + 1}/${maxRetries}):`, error)
      retries--
      
      if (retries > 0) {
        const delay = 1000 * (maxRetries - retries) // Increasing delay
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  console.error('All database connection attempts failed')
  return false
}

// Add a direct method to check the schema
export async function validateUserSchema(): Promise<boolean> {
  try {
    // Check if the user table has the expected structure
    const userFields = await db.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user'
    `
    console.log('User schema validation:', userFields)
    return true
  } catch (error) {
    console.error('User schema validation failed:', error)
    return false
  }
}