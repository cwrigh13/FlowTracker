# FlowTracker Backend API

A robust Node.js/TypeScript backend API for the FlowTracker library item management system.

## Features

- **Multi-tenant Architecture**: Support for multiple libraries with isolated data
- **JWT Authentication**: Secure user authentication and authorization
- **Role-based Access Control**: Admin, Staff, and Patron user roles
- **RESTful API**: Clean, well-documented API endpoints
- **PostgreSQL Database**: Robust data persistence with proper indexing
- **Input Validation**: Comprehensive request validation using Joi
- **Error Handling**: Centralized error handling and logging
- **Security**: Helmet, CORS, rate limiting, and input sanitization

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: Helmet, bcryptjs, express-rate-limit
- **Development**: Nodemon, ts-node

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your database credentials and other settings.

3. **Set up PostgreSQL database**:
   ```bash
   # Create database
   createdb flowtracker
   
   # Or using psql
   psql -c "CREATE DATABASE flowtracker;"
   ```

4. **Run database migrations**:
   ```bash
   npm run migrate
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify JWT token

### Libraries
- `GET /api/libraries` - Get library information
- `PUT /api/libraries` - Update library settings (Admin only)

### Issues
- `GET /api/issues` - Get all issues (with pagination and filtering)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue (Staff+ only)
- `PUT /api/issues/:id` - Update issue (Staff+ only)
- `DELETE /api/issues/:id` - Delete issue (Staff+ only)

### Users
- `GET /api/users` - Get all users in library
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Collections
- `GET /api/collections` - Get all collections
- `POST /api/collections` - Create collection (Staff+ only)
- `PUT /api/collections/:id` - Update collection (Staff+ only)
- `DELETE /api/collections/:id` - Delete collection (Staff+ only)

## Database Schema

The database uses a multi-tenant architecture with the following main entities:

- **libraries**: Library tenants
- **users**: Library staff and patrons
- **collections**: Library item categories
- **issues**: Main tracking entities (problems/suggestions)
- **issue_labels**: Many-to-many relationship between issues and collections
- **issue_comments**: Comments and notes on issues
- **issue_attachments**: File attachments
- **issue_status_history**: Audit trail for status changes
- **notifications**: User notifications

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/flowtracker
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flowtracker
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

### Project Structure

```
backend/
├── src/
│   ├── database/
│   │   ├── connection.ts      # Database connection and utilities
│   │   └── migrate.ts         # Migration script
│   ├── middleware/
│   │   ├── auth.ts           # Authentication middleware
│   │   └── errorHandler.ts   # Error handling middleware
│   ├── routes/
│   │   ├── auth.ts           # Authentication routes
│   │   ├── issues.ts         # Issue management routes
│   │   ├── libraries.ts      # Library management routes
│   │   ├── users.ts          # User management routes
│   │   └── collections.ts    # Collection management routes
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   └── server.ts             # Main server file
├── database/
│   └── schema.sql            # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Joi schema validation
- **SQL Injection Prevention**: Parameterized queries
- **CORS Protection**: Configurable cross-origin requests
- **Rate Limiting**: Request rate limiting
- **Security Headers**: Helmet.js security headers
- **Error Handling**: Secure error responses

## Multi-tenancy

The system supports multiple libraries with complete data isolation:

- Each library has its own data namespace
- Users can only access their library's data
- Library-specific collections and settings
- Customizable branding and workflows

## API Documentation

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Response Format

All API responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "error": "Error message if success is false"
}
```

### Pagination

List endpoints support pagination:
```
GET /api/issues?page=1&limit=20&status=Newly Reported&type=problem
```

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure JWT secret
- [ ] Set up SSL/HTTPS
- [ ] Configure production database
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (nginx)
- [ ] Set up backup strategy

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
