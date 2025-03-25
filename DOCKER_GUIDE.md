# Employee Pulse Application - Docker Guide

This guide provides instructions on how to run the Employee Pulse Application using Docker and Docker Compose, for both development and production environments.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.10.0 or higher)
- Git (to clone the repository)

## Setting Up the Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/AishwaryShrivastav/Employee-Pulse-Application.git
   cd Employee-Pulse-Application
   ```

2. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your preferred values:
   ```bash
   nano .env
   ```

## Development Environment

The development environment uses the standard `docker-compose.yml` file and is designed for local development and testing.

### Starting the Development Environment

1. Build and start all services:
   ```bash
   docker-compose up --build
   ```

   Or, if you have npm installed:
   ```bash
   npm run start:build
   ```

2. To run in detached mode (background):
   ```bash
   docker-compose up -d
   ```

3. To seed the database with initial data:
   ```bash
   docker-compose exec backend npm run seed
   ```

   Or, if you have npm installed:
   ```bash
   npm run seed
   ```

### Accessing the Development Environment

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- API Documentation: http://localhost:3001/api/docs
- MongoDB: localhost:27017 (Use a MongoDB client to connect)

### Stopping the Development Environment

1. To stop the services:
   ```bash
   docker-compose down
   ```

2. To stop and remove volumes (will delete your data):
   ```bash
   docker-compose down -v
   ```

## Production Environment

The production environment uses `docker-compose.prod.yml` and includes additional security measures, Nginx for serving the frontend, and SSL/TLS support.

### Setting Up the Production Environment

1. Configure your `.env` file with production values:
   ```
   NODE_ENV=production
   DOMAIN_NAME=yourdomain.com
   MONGO_INITDB_ROOT_USERNAME=admin
   MONGO_INITDB_ROOT_PASSWORD=secure_password_here
   JWT_SECRET=very_long_random_string
   ```

2. Set up the Nginx directory structure:
   ```bash
   ./setup-nginx.sh
   ```

3. Install SSL certificates in the `nginx/ssl` directory:
   - If using Let's Encrypt:
     ```bash
     sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
     sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
     sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
     sudo chmod -R 755 nginx/ssl
     ```
   - If using your own certificates, place them in the `nginx/ssl` directory:
     - `fullchain.pem`: Your certificate chain
     - `privkey.pem`: Your private key

### Starting the Production Environment

1. Build and start all services:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

2. To seed the database with initial data:
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npm run seed
   ```

### Accessing the Production Environment

- Website: https://yourdomain.com
- API: https://yourdomain.com/api
- API Documentation: https://yourdomain.com/api/docs

### Stopping the Production Environment

1. To stop the services:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

2. To stop and remove volumes (will delete your data):
   ```bash
   docker-compose -f docker-compose.prod.yml down -v
   ```

## Maintenance and Monitoring

### Viewing Container Logs

1. To view logs from all containers:
   ```bash
   docker-compose logs
   ```

2. To view logs from a specific service:
   ```bash
   docker-compose logs [service_name]
   ```
   
   Example:
   ```bash
   docker-compose logs backend
   ```

3. To follow logs in real-time:
   ```bash
   docker-compose logs -f [service_name]
   ```

### Checking Container Status

```bash
docker-compose ps
```

### Restarting Services

```bash
docker-compose restart [service_name]
```

Example:
```bash
docker-compose restart backend
```

## Troubleshooting

### Container doesn't start

Check the container logs:
```bash
docker-compose logs [service_name]
```

### MongoDB Connection Issues

1. Verify MongoDB is running:
   ```bash
   docker-compose ps mongodb
   ```

2. Check if the MongoDB container is healthy:
   ```bash
   docker inspect --format "{{.State.Health.Status}}" $(docker-compose ps -q mongodb)
   ```

3. Verify the connection string in the `.env` file.

### Frontend Cannot Connect to Backend

1. Verify that the backend container is running:
   ```bash
   docker-compose ps backend
   ```

2. Check the backend logs for errors:
   ```bash
   docker-compose logs backend
   ```

3. Ensure `REACT_APP_API_URL` is set correctly in your `.env` file.

## CI/CD Pipeline Integration

For CI/CD pipeline integration, use the following commands in your deployment scripts:

```bash
# Pull the latest code
git pull

# Build and start the production environment
docker-compose -f docker-compose.prod.yml up --build -d

# Run database migrations and seed data if needed
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

## Security Considerations

1. Never commit the `.env` file to version control
2. Regularly update Docker images and dependencies
3. Enable regular database backups
4. Keep SSL certificates up to date
5. Follow the principle of least privilege for MongoDB users 