#!/bin/bash

# Script to run tests for the Employee Pulse Application

# Show commands being executed
set -x
# Exit on any error
set -e

echo "Starting tests for Employee Pulse Application..."

# Check if Docker is running MongoDB
if docker ps | grep -q mongo; then
  echo "MongoDB container is running, proceeding with tests..."
else
  echo "Starting MongoDB in Docker container for tests..."
  docker-compose up -d mongodb
  # Wait for MongoDB to initialize
  sleep 5
fi

# Backend tests
echo "Running backend tests..."
cd backend
# Unit tests
echo "Running backend unit tests..."
npm test

# E2E tests (if MongoDB is available)
echo "Running backend end-to-end tests..."
npm run test:e2e

# Frontend tests
echo "Running frontend tests..."
cd ../frontend
npm test

echo "All tests completed successfully!" 