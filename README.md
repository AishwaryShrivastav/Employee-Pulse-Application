# Employee Pulse Application

A full-stack application for managing employee surveys and feedback.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn
- Docker and Docker Compose (for containerized deployment)

## Development Setup

### Option 1: Local Development (Faster for Testing)

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Setup MongoDB**
   - Create a data directory for MongoDB:
     ```bash
     mkdir -p data/db
     ```
   - Start MongoDB (in a separate terminal):
     ```bash
     npm run start:mongodb
     ```
   - Or use your existing MongoDB installation (make sure it's running on mongodb://localhost:27017)

3. **Start the Application**
   
   a. Full Development Stack:
   ```bash
   npm run dev
   ```
   This will start MongoDB, backend, and frontend concurrently.

   b. Quick Development (if MongoDB is already running):
   ```bash
   npm run dev:quick
   ```
   This will only start the backend and frontend.

4. **Seed the Database**
   ```bash
   npm run seed:db
   ```

### Option 2: Docker Development

1. **Start with Docker Compose**
   ```bash
   npm start
   ```
   Or to rebuild containers:
   ```bash
   npm run start:build
   ```

## Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api

## Default Login Credentials

1. **Admin Account**
   - Email: admin@example.com
   - Password: admin123

2. **Employee Account**
   - Email: john@example.com
   - Password: employee123

## Project Structure

```
employee-pulse-application/
├── frontend/          # React frontend
├── backend/           # NestJS backend
├── data/             # MongoDB data directory
└── docker-compose.yml # Docker composition
```

## Environment Variables

The application uses the following environment variables:

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/employee-pulse
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## Features

- User authentication with JWT
- Role-based access control (Admin, HR, Employee)
- Survey creation and management
- Employee feedback collection
- Response analytics and export
- Real-time updates
- Swagger API documentation

## Tech Stack

### Backend
- NestJS (Node.js framework)
- MongoDB with Mongoose
- JWT Authentication
- Jest for testing
- Swagger/OpenAPI documentation

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Axios for API communication
- React Router for navigation

### Infrastructure
- Docker and Docker Compose
- MongoDB
- Node.js

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### API Documentation
Once the application is running, you can access the Swagger API documentation at:
http://localhost:3001/api/docs

### Code Quality

The project uses ESLint and Prettier for code quality and formatting:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

You can also run these commands for specific parts of the project:

```bash
# Backend only
npm run lint:backend
npm run lint:fix:backend
npm run format:backend

# Frontend only
npm run lint:frontend
npm run lint:fix:frontend
npm run format:frontend
```

ESLint is configured with:
- TypeScript support
- React best practices
- Prettier integration
- Strict type checking
- Common code style rules

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

The application includes comprehensive test coverage:
- Unit tests for all backend services
- Integration tests for API endpoints
- Frontend component testing
- End-to-end testing

Run the test suites:
```bash
# Backend tests with coverage
cd backend
npm run test:cov

# Frontend tests
cd frontend
npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 