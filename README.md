# Employee Pulse Survey Application

A full-stack application for conducting employee pulse surveys, built with NestJS, MongoDB, and React.

## Features

- User authentication with JWT
- Role-based access control (Admin/Employee)
- Survey creation and management
- Survey response submission
- Response history viewing
- Data export functionality
- Modern and responsive UI

## Project Structure

```
.
├── backend/           # NestJS backend application
│   ├── src/          # Source code
│   ├── test/         # Test files
│   └── package.json  # Backend dependencies
│
└── frontend/         # React frontend application
    ├── src/          # Source code
    ├── public/       # Static files
    └── package.json  # Frontend dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (v6 or higher)

## Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   MONGODB_URI=mongodb://localhost:27017/employee-pulse
   JWT_SECRET=your-secret-key
   PORT=3000
   ```

4. Start the development server:
   ```bash
   npm run start:dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   REACT_APP_API_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Surveys

- `GET /api/surveys` - Get all surveys (admin only)
- `POST /api/surveys` - Create a new survey (admin only)
- `DELETE /api/surveys/:id` - Delete a survey (admin only)
- `POST /api/surveys/:id/responses` - Submit a survey response
- `GET /api/surveys/responses/my` - Get user's responses
- `GET /api/surveys/responses` - Get all responses (admin only)
- `GET /api/surveys/responses/export` - Export responses to CSV (admin only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 