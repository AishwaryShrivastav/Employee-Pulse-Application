# Employee Pulse Application Tests

This directory contains documentation about test cases for the Employee Pulse Application.

## Test Structure

The tests in this project are organized as follows:

### Backend Tests

#### Unit Tests

Unit tests validate individual components in isolation with mocked dependencies.

- `backend/src/auth/auth.service.spec.ts`: Tests the authentication service functionality including user validation, login, and registration.
- `backend/src/survey/survey.service.spec.ts`: Tests the survey service with CRUD operations.
- `backend/src/responses/responses.service.spec.ts`: Tests the responses service including creation, retrieval, and status checking.

#### End-to-End Tests

E2E tests validate the entire application flow through HTTP requests.

- `backend/test/auth.e2e-spec.ts`: Tests the authentication API endpoints including registration, login, and profile retrieval.
- `backend/test/surveys.e2e-spec.ts`: Tests the survey API endpoints for both admin and employee users.

### Frontend Tests

Frontend tests use React Testing Library to test component rendering and interactions.

- `frontend/src/components/Login.test.tsx`: Tests the login form component including rendering, input handling, form submission, and error states.
- `frontend/src/components/SurveyList.test.tsx`: Tests the survey list component including rendering, actions based on user roles, and interactions.

## Running Tests

### Prerequisites

- Node.js 14+ and npm
- MongoDB (can be run via Docker as configured in the script)

### Running All Tests

We provide a convenient script to run all tests:

```bash
./runTests.sh
```

This script will:
1. Check if MongoDB is running in Docker, and start it if needed
2. Run backend unit tests
3. Run backend E2E tests
4. Run frontend unit tests

### Running Tests Separately

#### Backend Unit Tests

```bash
cd backend
npm test
```

For watching mode during development:

```bash
cd backend
npm run test:watch
```

#### Backend E2E Tests

```bash
cd backend
npm run test:e2e
```

Make sure MongoDB is running before executing E2E tests.

#### Frontend Tests

```bash
cd frontend
npm test
```

For watching mode during development:

```bash
cd frontend
npm test -- --watch
```

## Test Coverage

To generate test coverage reports:

### Backend

```bash
cd backend
npm run test:cov
```

### Frontend

```bash
cd frontend
npm test -- --coverage
```

## Writing New Tests

### Backend Unit Tests

1. Create a `.spec.ts` file next to the file you want to test
2. Mock dependencies using Jest's mocking capabilities
3. Test each method with different scenarios

### Backend E2E Tests

1. Add tests to the existing files in `backend/test/` or create new ones
2. Use supertest to simulate HTTP requests
3. Ensure proper test data setup and cleanup

### Frontend Tests

1. Create a `.test.tsx` file next to the component you want to test
2. Use React Testing Library to render components and simulate user interactions
3. Mock API calls and context providers as needed 