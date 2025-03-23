# Employee Pulse Survey Frontend

This is the frontend application for the Employee Pulse Survey system. It provides a user interface for both employees and administrators to interact with the survey system.

## Features

- User authentication (login/register)
- Employee dashboard
  - View available surveys
  - Submit survey responses
  - View response history
- Admin dashboard
  - View all survey responses
  - Export responses to CSV
  - Manage surveys (create/delete)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend API running on `http://localhost:3000`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   REACT_APP_API_URL=http://localhost:3000/api
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── contexts/      # React contexts (auth, etc.)
  ├── pages/         # Page components
  ├── services/      # API services
  ├── styles/        # Global styles
  ├── types/         # TypeScript type definitions
  ├── App.tsx        # Main application component
  └── index.tsx      # Application entry point
```

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 