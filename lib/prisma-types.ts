import { PrismaClient } from '@prisma/client'

// This file provides type information for the database client

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export type { PrismaClient }

// No need to extend PrismaClient - the proper way is to use the Prisma-generated types directly
