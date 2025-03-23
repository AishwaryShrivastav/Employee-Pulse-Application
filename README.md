# Employee Pulse Application

A full-stack application for managing employee surveys and feedback. Built with NestJS, React, and MongoDB.

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

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Running with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd employee-pulse-application
```

2. Start the application:
```bash
npm run start:build
```

This will:
- Build and start all containers
- Set up the MongoDB database
- Start the backend on port 3001
- Start the frontend on port 3000

3. Seed the database (optional):
```bash
npm run seed
```

### Test Credentials

After seeding, you can use these accounts:

1. Admin User:
   - Email: admin@example.com
   - Password: admin123

2. HR User:
   - Email: hr@example.com
   - Password: hr123

3. Employee User:
   - Email: john@example.com
   - Password: employee123

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

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── users/        # User management
│   │   ├── survey/       # Survey management
│   │   ├── responses/    # Survey responses
│   │   └── seed/         # Database seeding
│   └── test/
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── contexts/    # React contexts
│   └── public/
└── docker-compose.yml
```

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