/**
 * Database Verification Script
 * 
 * This script verifies your database connection and schema.
 * Run it with: npx ts-node scripts/verify-db.ts
 */

import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function main() {
  console.log('Starting database verification...')
  
  // Check environment variables
  console.log('\nEnvironment Variables:')
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`)
  console.log(`DIRECT_URL: ${process.env.DIRECT_URL ? 'Set' : 'Not set'}`)
  
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set in environment variables')
    process.exit(1)
  }
  
  // Create a new Prisma client
  console.log('\nInitializing Prisma client...')
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn']
  })
  
  try {
    // Test database connection
    console.log('\nTesting database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check if tables exist
    console.log('\nChecking database schema...')
    
    // Check users table
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ Users table exists (${userCount} users)`)
    } catch (error) {
      console.error('❌ Users table does not exist or is not accessible')
    }
    
    // Check courses table
    try {
      const courseCount = await prisma.course.count()
      console.log(`✅ Courses table exists (${courseCount} courses)`)
    } catch (error) {
      console.error('❌ Courses table does not exist or is not accessible')
    }
    
    // Check projects table
    try {
      const projectCount = await prisma.project.count()
      console.log(`✅ Projects table exists (${projectCount} projects)`)
    } catch (error) {
      console.error('❌ Projects table does not exist or is not accessible')
    }
    
    // Check activities table
    try {
      const activityCount = await prisma.activity.count()
      console.log(`✅ Activities table exists (${activityCount} activities)`)
    } catch (error) {
      console.error('❌ Activities table does not exist or is not accessible')
    }
    
    // Check sessions table
    try {
      const sessionCount = await prisma.session.count()
      console.log(`✅ Sessions table exists (${sessionCount} sessions)`)
    } catch (error) {
      console.error('❌ Sessions table does not exist or is not accessible')
    }
    
    console.log('\nDatabase verification complete!')
    
  } catch (error) {
    console.error('\n❌ Database verification failed:', error)
    process.exit(1)
  } finally {
    // Disconnect from the database
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
  }) 