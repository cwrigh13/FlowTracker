# FlowTracker Testing Guide

This guide covers the comprehensive testing setup for FlowTracker, including backend API tests, frontend component tests, and end-to-end testing.

## 🧪 Testing Overview

FlowTracker uses a multi-layered testing approach:

- **Backend Tests**: Jest + Supertest for API endpoints and database operations
- **Frontend Tests**: Vitest + React Testing Library for component testing
- **Integration Tests**: Full API workflow testing
- **End-to-End Tests**: Playwright for complete user journey testing

## 📁 Test Structure

```
├── backend/
│   ├── tests/
│   │   ├── setup.ts                 # Test database setup
│   │   ├── globalSetup.ts           # Global test initialization
│   │   ├── globalTeardown.ts        # Global test cleanup
│   │   ├── routes/                  # API endpoint tests
│   │   │   ├── auth.test.ts
│   │   │   ├── issues.test.ts
│   │   │   ├── collections.test.ts
│   │   │   ├── users.test.ts
│   │   │   └── libraries.test.ts
│   │   ├── middleware/              # Middleware tests
│   │   │   ├── auth.test.ts
│   │   │   └── errorHandler.test.ts
│   │   └── database/                # Database tests
│   │       └── connection.test.ts
│   ├── jest.config.js               # Jest configuration
│   └── run-tests.js                 # Test runner script
├── src/
│   └── test/                        # Frontend tests
│       ├── setup.ts                 # Test setup
│       ├── components/              # Component tests
│       │   └── LoginForm.test.tsx
│       ├── contexts/                # Context tests
│       │   └── AuthContext.test.tsx
│       └── services/                # Service tests
│           └── api.test.ts
├── vitest.config.ts                 # Vitest configuration
└── run-all-tests.js                 # Complete test runner
```

## 🚀 Running Tests

### Backend Tests

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Run all backend tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Frontend Tests

```bash
# From project root
npm install

# Run all frontend tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests once (for CI)
npm run test:run
```

### All Tests

```bash
# Run both backend and frontend tests
node run-all-tests.js
```

## 🗄️ Test Database Setup

The backend tests use a separate test database (`flowtracker_test`) that is automatically created and cleaned up.

### Prerequisites

1. PostgreSQL must be running
2. Test database credentials in `backend/env.test`:
   ```env
   TEST_DB_HOST=localhost
   TEST_DB_PORT=5432
   TEST_DB_NAME=flowtracker_test
   TEST_DB_USER=postgres
   TEST_DB_PASSWORD=your_password
   ```

### Database Lifecycle

- **Global Setup**: Creates test database and runs schema migrations
- **Before Each Test**: Cleans all data from test tables
- **Global Teardown**: Drops test database after all tests complete

## 📊 Test Coverage

### Backend Coverage Goals

- **API Routes**: 95%+ coverage
- **Middleware**: 90%+ coverage
- **Database Operations**: 85%+ coverage
- **Error Handling**: 90%+ coverage

### Frontend Coverage Goals

- **Components**: 80%+ coverage
- **Hooks**: 85%+ coverage
- **Services**: 90%+ coverage
- **Contexts**: 85%+ coverage

## 🧩 Test Categories

### Backend Tests

#### API Route Tests
- **Authentication**: Login, registration, token verification
- **Issues**: CRUD operations, filtering, validation
- **Collections**: CRUD operations, library isolation
- **Users**: User management, role-based access
- **Libraries**: Library settings, multi-tenancy

#### Middleware Tests
- **Auth Middleware**: Token validation, user verification
- **Error Handler**: Error formatting, status codes

#### Database Tests
- **Connection**: Database connectivity, concurrent connections
- **Schema**: Table structure, foreign keys, indexes
- **Transactions**: Data integrity, rollback scenarios

### Frontend Tests

#### Component Tests
- **LoginForm**: Form validation, submission, error handling
- **Issue Components**: Rendering, user interactions
- **Modal Components**: Open/close, form submission

#### Context Tests
- **AuthContext**: Login/logout, state management
- **Data Contexts**: Data fetching, caching

#### Service Tests
- **API Service**: HTTP requests, error handling
- **Local Storage**: Data persistence, cleanup

## 🔧 Test Utilities

### Backend Test Helpers

```typescript
// Create test data
const testLibrary = await createTestLibrary();
const testUser = await createTestUser(testLibrary.id, 'admin');
const testCollection = await createTestCollection(testLibrary.id);
const testIssue = await createTestIssue(testLibrary.id, testUser.id, testCollection.id);

// Clean database
await cleanTestDatabase();
```

### Frontend Test Helpers

```typescript
// Mock API calls
vi.mock('../../services/api', () => ({
  login: vi.fn(),
  getIssues: vi.fn(),
}));

// Mock context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));
```

## 🐛 Debugging Tests

### Backend Debugging

```bash
# Run specific test file
npm test -- auth.test.ts

# Run tests with verbose output
npm test -- --verbose

# Run tests matching pattern
npm test -- --testNamePattern="should login"
```

### Frontend Debugging

```bash
# Run specific test file
npm test -- LoginForm.test.tsx

# Run tests with UI
npm run test:ui

# Run tests in debug mode
npm test -- --reporter=verbose
```

## 📈 Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          npm install
          cd backend && npm install
          
      - name: Run backend tests
        run: cd backend && npm run test:ci
        
      - name: Run frontend tests
        run: npm run test:run
```

## 🎯 Best Practices

### Test Writing

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: One assertion per test
4. **Mock External Dependencies**: Isolate units under test
5. **Clean Setup/Teardown**: Ensure test isolation

### Test Data

1. **Use Factories**: Create test data with helper functions
2. **Clean State**: Reset state between tests
3. **Realistic Data**: Use realistic test data
4. **Edge Cases**: Test boundary conditions

### Performance

1. **Parallel Execution**: Run tests in parallel when possible
2. **Database Cleanup**: Efficiently clean test data
3. **Mock Heavy Operations**: Mock slow external services
4. **Test Timeouts**: Set appropriate timeouts

## 🚨 Common Issues

### Backend Issues

- **Database Connection**: Ensure PostgreSQL is running
- **Test Database**: Check test database credentials
- **Port Conflicts**: Ensure test port (3002) is available

### Frontend Issues

- **Module Resolution**: Check import paths and aliases
- **Mock Setup**: Ensure mocks are properly configured
- **Environment Variables**: Set NODE_ENV=test

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

*Last Updated: December 2024*
*Version: 1.0*
