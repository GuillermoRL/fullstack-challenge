# Aura CRM - Engineering Onboarding Guide

Welcome to Aura CRM! This document will help you understand the architecture, tech stack, and setup process for your first time working with the project.

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [First-Time Setup](#first-time-setup)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Common Commands](#common-commands)
- [Key Concepts](#key-concepts)
- [Resources](#resources)

---

## Project Overview

**Aura CRM** is a modern Customer Relationship Management system designed to help organizations manage their sales pipeline, contacts, deals, and workflows. The project is built as a full-stack TypeScript application using a monorepo structure.

**Purpose**: This is a challenge-based technical assessment where candidates complete business-critical features to demonstrate full-stack development capabilities and clean architecture knowledge.

**Key Features**:
- User authentication and authorization
- Contact management
- Deal tracking through customizable workflows
- Organization management
- Dashboard analytics
- Multi-stage sales pipeline

---

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router 7** for navigation
- **TailwindCSS 4** for styling
- **Vite 5** as build tool (dev server on port 3000)
- **Vitest** + Testing Library for testing
- **Path alias**: `@/*` maps to `src/`

### Backend
- **Node.js 18+** with TypeScript
- **Express 4** web framework (API server on port 4000)
- **TypeORM 0.3** for database operations
- **PostgreSQL 16** as database
- **JWT** for authentication
- **Bcryptjs** for password hashing
- **Vitest** for testing
- **Path aliases**: `@modules/*` and `@shared/*`

### Infrastructure
- **pnpm** for monorepo package management
- **Docker Compose** for PostgreSQL containerization
- **TypeScript 5.6** across the stack

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

### Required
- **Node.js** v18 or higher ([download](https://nodejs.org/))
- **pnpm** v8 or higher (install: `npm install -g pnpm`)
- **Docker Desktop** ([download](https://www.docker.com/products/docker-desktop/))
- **Git** ([download](https://git-scm.com/))

### Recommended
- **Visual Studio Code** or your preferred IDE
- **PostgreSQL client** (optional, for direct database access)
  - TablePlus, pgAdmin, or DBeaver
- **Postman** or similar API testing tool

### Verify Installations
```bash
node --version    # Should be v18+
pnpm --version    # Should be v8+
docker --version  # Should be installed
git --version     # Should be installed
```

---

## First-Time Setup

Follow these steps to get the project running on your machine:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd fullstack-challenge
```

### 2. Install Dependencies
```bash
# Install all dependencies for both frontend and backend
pnpm install
```

### 3. Set Up the Database

#### Start PostgreSQL with Docker
```bash
# Start PostgreSQL container in detached mode
docker-compose up -d

# Verify it's running
docker ps
```

You should see a PostgreSQL container running on port 5432.

#### Database Connection Details
- **Host**: localhost
- **Port**: 5432
- **Database**: fullstack_db
- **Username**: postgres
- **Password**: postgres

### 4. Configure Backend Environment

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

The `.env` file should contain:
```env
PORT=4000
JWT_SECRET=your-secret-key-change-in-production
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=fullstack_db
NODE_ENV=development
```

### 5. Run Database Migrations (if any)
```bash
# From the backend directory
pnpm migration:run
```

### 6. Start the Development Servers

#### Option A: Start Both Frontend and Backend Together
```bash
# From the root directory
pnpm dev
```

#### Option B: Start Individually
```bash
# Terminal 1 - Backend
pnpm dev:backend

# Terminal 2 - Frontend
pnpm dev:frontend
```

### 7. Verify Everything is Running

- **Frontend**: Open http://localhost:3000
- **Backend Health Check**: Open http://localhost:4000/api/health
- **Database**: Connect using a PostgreSQL client with the credentials above

You should see the login page at http://localhost:3000

### 8. Create Your First User

Use the registration page or make a POST request:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

---

## Architecture Overview

### Backend: Clean Architecture (Domain-Driven Design)

The backend follows a **modular, layered architecture** with strict separation of concerns:

```
module/
├── domain/              # Business logic & interfaces
│   ├── [Entity].ts      # Domain model
│   └── [Repository].ts  # Repository interface
├── application/         # Use cases
│   ├── [Entity]UseCases.ts
│   └── [Entity].test.ts
├── infrastructure/      # Implementation details
│   ├── Postgres[Entity]Repository.ts
│   └── [Entity]Entity.ts  # TypeORM entity
└── http/               # HTTP layer
    ├── [Entity]Controller.ts
    └── [Entity]Routes.ts
```

**Key Principles**:
- **Domain layer** has NO dependencies on infrastructure
- **Application layer** contains business logic (use cases)
- **Infrastructure layer** implements repositories using TypeORM
- **HTTP layer** handles requests/responses and routing

**Example Data Flow**:
```
HTTP Request → Controller → Use Case → Repository → Database
                    ↓
                Response
```

### Frontend: Component-Based Architecture

```
src/
├── components/         # Reusable UI components
├── pages/             # Route-level components
├── services/          # API communication
├── context/           # React Context (state management)
└── test/              # Testing utilities
```

**State Management**:
- **AuthContext** manages authentication state
- **localStorage** persists tokens
- Services handle API calls and return promises

**Routing**:
- Public routes: `/login`, `/register`
- Protected routes: `/dashboard`, `/contacts`, `/deals`, `/workflows`, `/settings`

---

## Project Structure

```
fullstack-challenge/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Layout, ProtectedRoute
│   │   ├── context/            # AuthContext
│   │   ├── pages/              # LoginPage, DashboardPage, etc.
│   │   ├── services/           # API clients
│   │   ├── test/               # Test utilities
│   │   ├── App.tsx             # Main app with routing
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── modules/            # Feature modules
│   │   │   ├── auth/           # Authentication
│   │   │   ├── users/          # User management
│   │   │   ├── organization/   # Organizations
│   │   │   ├── contact/        # Contacts
│   │   │   ├── workflow/       # Workflows & stages
│   │   │   └── deal/           # Deals
│   │   ├── shared/             # Shared infrastructure
│   │   │   ├── http/           # Middleware, types
│   │   │   └── infrastructure/ # Database config
│   │   ├── app.ts              # Express app factory
│   │   └── index.ts            # Server entry point
│   ├── package.json
│   ├── vitest.config.ts
│   └── tsconfig.json
│
├── challenges/                  # 10 feature challenges
│   ├── 01-secure-authentication/
│   ├── 02-data-validation/
│   └── ...
│
├── docker-compose.yml          # PostgreSQL setup
├── pnpm-workspace.yaml         # Monorepo config
├── package.json                # Root scripts
├── README.md                   # Project overview
├── TECHNICAL_TEST.md           # Challenge overview
└── POINT_SYSTEM.md            # Scoring system
```

---

## Development Workflow

### Daily Development

1. **Start the database** (if not running):
   ```bash
   docker-compose up -d
   ```

2. **Start dev servers**:
   ```bash
   pnpm dev
   ```

3. **Make changes** to code (hot reload is enabled)

4. **Run tests** as you develop:
   ```bash
   pnpm test
   ```

5. **Stop servers**: Press `Ctrl+C` in terminals

6. **Stop database** (when done for the day):
   ```bash
   docker-compose down
   ```

### Making Backend Changes

When working on backend features:

1. **Identify the module** you need to modify (e.g., `contact`, `deal`)
2. **Start with domain layer**: Define entities and repository interfaces
3. **Implement use cases** in application layer
4. **Add infrastructure**: Implement repository with TypeORM
5. **Create HTTP layer**: Add controller and routes
6. **Wire it up** in `app.ts` (dependency injection)
7. **Write tests** for use cases

### Making Frontend Changes

When working on frontend features:

1. **Create/modify components** in `src/components/`
2. **Add API calls** in `src/services/`
3. **Create/update pages** in `src/pages/`
4. **Update routing** in `App.tsx` if needed
5. **Style with TailwindCSS** classes
6. **Write component tests**

### Database Changes

When modifying the database schema:

1. **Update TypeORM entities** in `infrastructure/[Entity]Entity.ts`
2. **Generate migration**:
   ```bash
   cd backend
   pnpm migration:generate src/shared/infrastructure/database/migrations/MigrationName
   ```
3. **Review the generated migration** file
4. **Run migration**:
   ```bash
   pnpm migration:run
   ```
5. **Update domain models** to match

### Code Quality Checks

Before committing:

```bash
# Run all tests
pnpm test:run

# Run linters
pnpm lint

# Build both projects
pnpm build
```

---

## Testing Guidelines

### Backend Testing

Tests are located next to the use cases:
```
application/
├── ContactUseCases.ts
└── ContactUseCases.test.ts
```

**Example test structure**:
```typescript
describe('ContactUseCases', () => {
  it('should create a new contact', async () => {
    // Arrange: Set up test data and mocks
    const mockRepository = ...;
    const useCase = new ContactUseCases(mockRepository);

    // Act: Execute the use case
    const result = await useCase.createContact(...);

    // Assert: Verify the result
    expect(result).toBeDefined();
  });
});
```

**Run backend tests**:
```bash
cd backend
pnpm test              # Watch mode
pnpm test:run          # Single run
pnpm test:coverage     # With coverage
```

### Frontend Testing

Tests use React Testing Library:
```
pages/
├── LoginPage.tsx
└── LoginPage.test.tsx
```

**Example test structure**:
```typescript
describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});
```

**Run frontend tests**:
```bash
cd frontend
pnpm test              # Watch mode
pnpm test:run          # Single run
pnpm test:coverage     # With coverage
```

---

## Common Commands

### Root Level (Monorepo)
```bash
pnpm install           # Install all dependencies
pnpm dev               # Start both frontend and backend
pnpm test              # Run all tests (watch mode)
pnpm test:run          # Run all tests (single run)
pnpm build             # Build both projects
pnpm lint              # Lint both projects
```

### Frontend Specific
```bash
pnpm dev:frontend      # Start frontend dev server
pnpm test:frontend     # Run frontend tests
cd frontend
pnpm dev               # Alternative
pnpm test
pnpm build
```

### Backend Specific
```bash
pnpm dev:backend       # Start backend dev server
pnpm test:backend      # Run backend tests
cd backend
pnpm dev               # Alternative
pnpm test
pnpm build
pnpm migration:generate # Generate new migration
pnpm migration:run     # Apply migrations
pnpm migration:revert  # Revert last migration
```

### Docker
```bash
docker-compose up -d            # Start PostgreSQL
docker-compose down             # Stop PostgreSQL
docker-compose logs -f postgres # View logs
docker-compose ps               # List containers
docker-compose restart postgres # Restart database
```

---

## Key Concepts

### Authentication Flow

1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Backend validates credentials and returns JWT token
3. Frontend stores token in localStorage via `authService`
4. AuthContext provides token to the entire app
5. Protected API calls include token in `Authorization` header
6. Backend middleware validates token before processing requests

**Files to know**:
- Backend: `/backend/src/modules/auth/` (token generation)
- Backend: `/backend/src/shared/http/middleware/auth.middleware.ts`
- Frontend: `/frontend/src/context/AuthContext.tsx`
- Frontend: `/frontend/src/services/api.ts` (axios interceptor)

### Dependency Injection (Backend)

The backend uses **manual dependency injection** via factory functions:

```typescript
// In app.ts
const contactRepository = new PostgresContactRepository(dataSource);
const contactUseCases = new ContactUseCases(contactRepository);
const contactController = new ContactController(contactUseCases);
const contactRoutes = createContactRoutes(contactController, authMiddleware);
```

This pattern:
- Makes testing easier (inject mocks)
- Keeps modules decoupled
- Follows clean architecture principles

### TypeORM Entities vs Domain Models

- **Domain Model** (`/domain/Contact.ts`): Pure business logic, no decorators
- **TypeORM Entity** (`/infrastructure/ContactEntity.ts`): Database mapping with decorators

The repository pattern bridges these two:
```typescript
// Repository converts between domain and database
class PostgresContactRepository {
  async save(contact: Contact): Promise<Contact> {
    const entity = this.toEntity(contact);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }
}
```

### Path Aliases

To keep imports clean:

**Backend**:
```typescript
import { User } from '@modules/users/domain';
import { dataSource } from '@shared/infrastructure/database';
```

**Frontend**:
```typescript
import { LoginPage } from '@/pages';
import { api } from '@/services/api';
```

Configured in `tsconfig.json` and build tools.

---

## Resources

### Documentation
- **README.md** - Project overview and quick start
- **TECHNICAL_TEST.md** - Challenge-based assessment details
- **POINT_SYSTEM.md** - Scoring and evaluation criteria
- **challenges/** - Individual challenge specifications

### API Documentation
See `README.md` for a full list of API endpoints.

**Quick reference**:
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/contacts` - List contacts (protected)
- `POST /api/contacts` - Create contact (protected)
- `GET /api/deals` - List deals (protected)
- `GET /api/workflows` - List workflows (protected)

### External Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Guide](https://expressjs.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

---

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres

# Restart the database
docker-compose restart postgres

# Nuclear option: reset database
docker-compose down -v
docker-compose up -d
```

### Port Already in Use
```bash
# Find process using port 3000 or 4000
lsof -i :3000
lsof -i :4000

# Kill the process (replace PID)
kill -9 <PID>
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
pnpm install
```

### TypeScript Errors
```bash
# Rebuild TypeScript
pnpm build

# Check for type errors
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit
```

---

## Next Steps

1. **Explore the codebase**: Start by reading `README.md` and browsing the modules
2. **Run the app locally**: Follow the first-time setup above
3. **Review challenges**: Check out `/challenges/` to understand what needs to be built
4. **Pick a challenge**: Start with something that interests you (or follow the point system)
5. **Write tests**: Add test coverage as you implement features
6. **Ask questions**: Don't hesitate to reach out to the team

**Welcome to the team!** Happy coding!
