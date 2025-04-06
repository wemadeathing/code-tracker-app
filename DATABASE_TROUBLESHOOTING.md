# Database Troubleshooting Guide

This guide will help you diagnose and fix database connection issues in your CodeTrack application.

## Common Issues

### 1. "Cannot read properties of undefined (reading 'findMany')" Error

This error occurs when the Prisma client is not properly initialized. The error message indicates that `db.course`, `db.project`, or `db.activity` are undefined because the Prisma client itself isn't properly initialized.

### 2. Database Connection Failures

Connection failures can happen due to:
- Incorrect database URL
- Network connectivity issues
- Database server being down
- SSL configuration problems

## Solutions

### 1. Verify Database Connection

Run the database verification script to check your connection:

```bash
npx ts-node scripts/verify-db.ts
```

This script will:
- Check if your environment variables are set correctly
- Test the database connection
- Verify that all required tables exist

### 2. Check Environment Variables

Ensure your `.env` file has the correct database connection strings:

```
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
DIRECT_URL=postgresql://username:password@host:port/database?schema=public
```

For production environments, make sure to include SSL settings:

```
DATABASE_URL=postgresql://username:password@host:port/database?schema=public&sslmode=require
DIRECT_URL=postgresql://username:password@host:port/database?schema=public&sslmode=require
```

### 3. Sync Prisma Schema

If your database schema is out of sync with your Prisma schema, run:

```bash
npx prisma migrate dev --name fix_schema
```

Or if you're just testing:

```bash
npx prisma db push
```

### 4. Use Safe Database Operations

The application now includes a utility for safe database operations. Use it in your server actions:

```typescript
import { safeDatabaseOperation } from '@/lib/db-utils'

// Instead of:
const courses = await db.course.findMany({ where: { user_id } })

// Use:
const courses = await safeDatabaseOperation(
  () => db.course.findMany({ where: { user_id } }),
  [] // Return empty array as fallback
)
```

### 5. Check for Connection Pooling Issues

If you're experiencing connection pooling issues, add these parameters to your database URL:

```
DATABASE_URL=postgresql://username:password@host:port/database?schema=public&connection_limit=5&pool_timeout=0
```

### 6. Restart Your Application

Sometimes a simple restart can fix connection issues:

```bash
npm run dev
```

## Advanced Troubleshooting

### Database Logs

Check your database logs for any connection errors or timeouts.

### Network Connectivity

Ensure your application can reach the database server:

```bash
ping your-database-host
```

### SSL Issues

If you're having SSL issues, try these options in your database URL:

```
sslmode=prefer
sslmode=require
sslmode=verify-full
```

## Need More Help?

If you're still experiencing issues after trying these solutions, please:

1. Check the application logs for detailed error messages
2. Verify your database credentials and permissions
3. Contact your database provider for assistance
4. Open an issue in the project repository with detailed error information 