# Employee Pulse Application

A modern employee feedback management system with AI-powered insights, built with React, NestJS, and MongoDB.

## 🌟 Key Features

### Survey Management
- Create and manage customizable surveys
- Multiple question types (rating, choice, text)
- Survey templates and cloning
- Automated survey distribution

### AI-Powered Insights
- Real-time analysis of survey responses using OpenAI
- Sentiment analysis and trend identification
- Token-optimized processing
- Actionable recommendations

### Analytics & Reporting
- Interactive dashboards with real-time data
- Visual representation of survey results
- Response rate tracking
- Data export capabilities

### User Management
- Role-based access control (Admin/Employee)
- Secure JWT authentication
- User profile management
- Activity monitoring

## 📚 Documentation

Comprehensive documentation is available in the `/prd` directory:

- [Product Requirements Document](./prd/Employee_Pulse_Application_PRD.md) - Complete feature specifications and requirements
- [Technical Architecture](./prd/Technical_Architecture.md) - System design and component interactions
- [Deployment Guide](./prd/Deployment_Guide.md) - Detailed setup and configuration instructions

## 🚀 Quick Start

### Prerequisites
- Docker 20.10.x or higher
- Docker Compose 2.x or higher
- Git
- 4GB RAM minimum

### Development Setup

1. **Clone and Configure**
   ```bash
   # Clone repository
   git clone https://github.com/AishwaryShrivastav/Employee-Pulse-Application.git
   cd employee-pulse-application

   # Configure environment
   cp .env.example .env
   ```

2. **Environment Configuration**
   ```env
   # Required Configuration
   MONGODB_PORT=27017
   MONGO_INITDB_ROOT_USERNAME=admin
   MONGO_INITDB_ROOT_PASSWORD=secure_password_here
   MONGO_INITDB_DATABASE=employee_pulse
   BACKEND_PORT=3001
   FRONTEND_PORT=3000
   JWT_SECRET=your_secure_jwt_secret_key_here
   DOMAIN_NAME=localhost

   # Optional: AI Insights Feature
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Launch Application**
   ```bash
   # Development mode with logs
   docker-compose up --build

   # Production mode (detached)
   docker-compose up --build -d
   ```

4. **Access Applications**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:3001/api/docs
   - Admin Dashboard: http://localhost:3000/admin

### Default Accounts
```
Admin:
- Email: admin@example.com
- Password: admin123

Employee:
- Email: john@example.com
- Password: employee123
```

## 🐳 Docker Architecture

### Container Services

1. **Frontend (`employee-pulse-frontend`)**
   - Nginx-based React application
   - Port: 3000
   - Configuration: `frontend/nginx/nginx.conf`

2. **Backend (`employee-pulse-backend`)**
   - NestJS API server
   - Port: 3001
   - Swagger docs at `/api/docs`

3. **Database (`employee-pulse-mongodb`)**
   - MongoDB instance
   - Port: 27017
   - Persistent volume: `mongodb_data`

### Network Configuration
- Network: `employee-pulse-network` (bridge)
- Internal service discovery
- Isolated container communication

## 🛠️ Development Commands

```bash
# Start all services
docker-compose up --build

# Start specific service
docker-compose up frontend --build

# View logs
docker-compose logs -f [service_name]

# Stop all services
docker-compose down

# Reset database
docker-compose down -v

# Run backend tests
docker-compose exec backend npm test

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p secure_password_here
```

## 🔒 Security Best Practices

1. **Environment Security**
   - Never commit `.env` files
   - Use strong passwords
   - Rotate JWT secrets regularly

2. **API Security**
   - JWT authentication
   - Role-based access control
   - Rate limiting enabled
   - Input validation

3. **Database Security**
   - Strong authentication required
   - Encrypted connections
   - Regular backups
   - Access logging

## ⚡ Performance Optimization

1. **Frontend**
   - React component optimization
   - Lazy loading for routes
   - Caching strategies
   - Compressed static assets

2. **Backend**
   - Response caching
   - Database query optimization
   - Connection pooling
   - Rate limiting

3. **Database**
   - Proper indexing
   - Query optimization
   - Regular maintenance
   - Monitoring

## 🔍 Troubleshooting Guide

### Common Issues

1. **Container Startup Failures**
   ```bash
   # Check container status
   docker-compose ps
   
   # View detailed logs
   docker-compose logs -f
   ```

2. **Database Connection Issues**
   - Verify MongoDB credentials in `.env`
   - Check network connectivity
   - Ensure volume permissions

3. **API Errors**
   - Check backend logs
   - Verify JWT configuration
   - Validate API endpoints

### Health Checks
```bash
# Check frontend
curl http://localhost:3000

# Check backend health
curl http://localhost:3001/health

# Check MongoDB connection
docker-compose exec mongodb mongosh --eval "db.runCommand({ ping: 1 })"
```

## 📦 Production Deployment

1. **SSL Configuration**
   - Update `nginx.conf` with SSL settings
   - Configure SSL certificates
   - Enable HTTPS redirects

2. **Environment Setup**
   - Use production-grade passwords
   - Configure proper logging
   - Set up monitoring

3. **Backup Strategy**
   - Regular database backups
   - Configuration backups
   - Automated backup testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 