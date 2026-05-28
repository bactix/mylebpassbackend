# MyLebPass Backend API

Node.js Express backend with TypeScript.

## Project Structure

```
api/
├── config/           # Configuration (database, logger)
├── controllers/      # HTTP request handlers
├── helpers/          # Utilities (errors, response, ID generation)
├── middlewares/      # Express middlewares
├── models/           # TypeScript interfaces
├── routes/           # API routes
├── services/         # Business logic
├── validations/      # Input validation
├── app.ts            # Express app setup
└── index.ts          # Server entry point
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Server runs on `http://localhost:4000`

## Build

```bash
npm run build
```

## API Endpoints

### Health Check
- `GET /health`

### Users
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Example

```bash
# Create user
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Get all users
curl http://localhost:4000/api/users
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build TypeScript
- `npm start` - Run production build
- `npm test` - Run tests
- `npm run lint` - Check code style
- `npm run format` - Format code
