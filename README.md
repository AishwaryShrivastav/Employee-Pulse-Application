# Employee Pulse Application

A comprehensive employee survey and feedback management system with AI-powered insights.

## Features

- 🔐 Secure authentication with JWT
- 👥 Role-based access (Admin and Employee)
- 📊 Survey creation and management
- 📝 Employee feedback collection
- 📈 Response analytics with AI insights
- 🔄 Real-time updates
- 📱 Responsive design
- 🤖 OpenAI integration for survey insights

## Prerequisites

- Docker and Docker Compose
- Git

## Quick Start Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/employee-pulse-application.git
   cd employee-pulse-application
   ```

2. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```

   Edit the `.env` file and set the following required variables:
   ```env
   # MongoDB configuration
   MONGODB_PORT=27017
   MONGO_INITDB_ROOT_USERNAME=admin
   MONGO_INITDB_ROOT_PASSWORD=secure_password_here
   MONGO_INITDB_DATABASE=employee_pulse

   # Application ports
   BACKEND_PORT=3001
   FRONTEND_PORT=3000

   # JWT configuration
   JWT_SECRET=your_secure_jwt_secret_key_here

   # Domain configuration
   DOMAIN_NAME=localhost

   # OpenAI configuration (optional - for AI insights)
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start the application**
   ```bash
   # Build and start all services
   docker-compose up --build -d
   ```

   The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

4. **Default login credentials**

   Admin Account:
   - Email: admin@example.com
   - Password: admin123

   Employee Account:
   - Email: john@example.com
   - Password: employee123

## Docker Deployment Commands

```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Rebuild and start
docker-compose up --build -d

# Remove all containers and volumes
docker-compose down -v
```

## Project Structure

```
employee-pulse-application/
├── frontend/                 # React frontend application
│   ├── src/                 # Source code
│   ├── Dockerfile          # Frontend container configuration
│   └── package.json        # Frontend dependencies
├── backend/                 # NestJS backend application
│   ├── src/                # Source code
│   ├── Dockerfile          # Backend container configuration
│   └── package.json        # Backend dependencies
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── docker-compose.yml      # Docker composition
├── mongo-init.js          # MongoDB initialization script
└── README.md              # Project documentation
```

## Container Architecture

The application runs three main containers:

1. **Frontend Container (`employee-pulse-frontend`)**
   - Nginx server hosting the React application
   - Port: 3000
   - Built with Node.js 18 and Nginx Alpine

2. **Backend Container (`employee-pulse-backend`)**
   - NestJS application
   - Port: 3001
   - Built with Node.js 20
   - Handles API requests and business logic

3. **Database Container (`employee-pulse-mongodb`)**
   - MongoDB instance
   - Port: 27017
   - Persistent data storage
   - Automatically initialized with required users and collections

## Data Persistence

MongoDB data is persisted through a named volume:
- `mongodb_data`: Stores the database files

## Network Configuration

All services run on a dedicated Docker network:
- Network name: `employee-pulse-network`
- Type: bridge network
- Internal communication between services

## Security Notes

1. **Environment Variables**
   - Never commit the `.env` file
   - Use strong passwords in production
   - Change default admin credentials

2. **API Security**
   - All endpoints are JWT protected
   - Role-based access control implemented
   - Rate limiting enabled

3. **Database Security**
   - MongoDB authentication required
   - Secure password storage with hashing
   - Access restricted to container network

## Troubleshooting

1. **Container Issues**
   ```bash
   # Check container status
   docker-compose ps

   # Check container logs
   docker-compose logs

   # Restart specific service
   docker-compose restart [service_name]
   ```

2. **Database Issues**
   ```bash
   # Reset database
   docker-compose down -v
   docker-compose up -d
   ```

3. **Common Problems**
   - Port conflicts: Change ports in `.env` file
   - Database connection: Check MongoDB credentials
   - API errors: Check backend logs

## Production Deployment Notes

1. **SSL/TLS Configuration**
   - Configure SSL certificates
   - Update Nginx configuration
   - Enable HTTPS

2. **Backup Strategy**
   - Regular database backups
   - Volume backup plan
   - Monitoring setup

3. **Performance Optimization**
   - Enable Nginx caching
   - Configure MongoDB indexes
   - Optimize Docker images

## Support and Updates

For support, please open an issue in the GitHub repository. For updates and improvements:

1. **Update Application**
   ```bash
   git pull
   docker-compose down
   docker-compose up --build -d
   ```

2. **Backup Before Update**
   ```bash
   # Backup MongoDB data
   docker-compose exec -T mongodb mongodump --archive > backup.archive
   ``` 