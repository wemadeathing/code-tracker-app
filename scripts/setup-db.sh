#!/bin/bash

# Setup database script
echo "Setting up the database..."

# Generate Prisma client from schema
echo "Generating Prisma client..."
npx prisma generate

# Push the schema to the database
echo "Pushing schema to database..."
npx prisma db push

echo "Database setup complete!"
echo "You can now start your application and the database models will be recognized."
