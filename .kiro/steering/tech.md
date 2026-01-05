# Technology Stack

## Core Framework
- **Next.js 14** with App Router and TypeScript
- **React 18** with Server Components and Client Components
- **Tailwind CSS** for styling with PostCSS and Autoprefixer

## Backend & Database
- **PostgreSQL** for both internal dashboard database and external database connections
- **Next.js API Routes** and Server Actions for backend logic
- **pg** library for PostgreSQL connections with connection pooling
- **NextAuth.js v5** for authentication with credentials provider

## Security & Encryption
- **bcryptjs** for password hashing
- **AES-256-GCM encryption** for database credentials storage
- **Zod** for runtime type validation and input sanitization

## Development Tools
- **TypeScript** with strict mode enabled
- **ESLint** with Next.js configuration
- **dotenv** for environment variable management

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Setup
```bash
# Create internal dashboard database
createdb db_dashboard

# Run schema migrations
psql db_dashboard < database/schema.sql

# Create admin user
node scripts/create-admin.js
```

### Docker Deployment
```bash
docker build -t db-dashboard .
docker-compose up -d
```

## Architecture Patterns
- **Server-first approach**: Leverage Next.js Server Components for data fetching
- **Connection pooling**: Internal database uses persistent pool, external connections are per-request
- **Encryption at rest**: All external database credentials encrypted before storage
- **Audit logging**: Immutable audit trail for all database operations