# Build stage
FROM node:20-slim as builder

# Build arguments
ARG NODE_ENV=production

# Set environment variables
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim

# Build arguments
ARG NODE_ENV=production

# Set environment variables
ENV NODE_ENV=${NODE_ENV}

# Create app directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY .env* ./
COPY tsconfig*.json ./
COPY src ./src

# Copy wait-for-db script
COPY scripts/wait-for-db.sh ./wait-for-db.sh
RUN chmod +x ./wait-for-db.sh

# Install netcat for the wait-for-db script and ts-node for seeding
RUN apt-get update && apt-get install -y --no-install-recommends \
    netcat-openbsd \
    && npm install -g ts-node typescript \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user and grant necessary permissions
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    useradd -m nodeuser && \
    chown -R nodeuser:nodeuser /app

# Switch to non-root user
USER nodeuser

# Expose the application port
EXPOSE 3001

# Use wait-for-db script as entrypoint
CMD ["./wait-for-db.sh"] 