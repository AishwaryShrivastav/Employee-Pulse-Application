#!/bin/sh

echo "Waiting for MongoDB to be ready..."
while ! nc -z mongodb 27017; do
  sleep 1
done
echo "MongoDB is ready!"

# Run database seeding
echo "Running database seeding..."
npx ts-node src/scripts/seed.ts

# Start the application
npm run start:prod 