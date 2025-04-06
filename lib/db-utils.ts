import { db } from './db'

/**
 * Checks if the database client is properly initialized
 * @returns boolean indicating if the database client is initialized
 */
export function isDatabaseInitialized(): boolean {
  return !!db && typeof db === 'object'
}

/**
 * Safely executes a database operation with error handling
 * @param operation A function that performs a database operation
 * @param fallbackValue Value to return if the operation fails
 * @returns The result of the operation or the fallback value
 */
export async function safeDatabaseOperation<T>(
  operation: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    if (!isDatabaseInitialized()) {
      console.error('Database client is not initialized')
      return fallbackValue
    }
    
    return await operation()
  } catch (error: any) {
    console.error('Database operation error:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    
    // In production, return fallback value instead of throwing
    if (process.env.NODE_ENV === 'production') {
      return fallbackValue
    }
    
    throw error
  }
}

/**
 * Example usage of safe database operations
 * 
 * // Instead of:
 * const courses = await db.course.findMany({ where: { user_id } })
 * 
 * // Use:
 * const courses = await safeDatabaseOperation(
 *   () => db.course.findMany({ where: { user_id } }),
 *   []
 * )
 */ 