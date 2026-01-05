# Project Structure

## Root Level Organization
- **Configuration files**: Next.js, TypeScript, Tailwind, Docker configs at root
- **Documentation**: Multiple `.md` files for setup, deployment, and usage guides
- **Scripts**: Database setup and admin user creation utilities in `/scripts`

## Application Structure (`/app`)
Uses Next.js 14 App Router with file-based routing:

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx               # Landing page
├── globals.css            # Global Tailwind styles
├── providers.tsx          # Client-side providers wrapper
├── login/                 # Authentication pages
└── dashboard/             # Protected dashboard routes
    ├── layout.tsx         # Dashboard layout wrapper
    ├── page.tsx          # Dashboard home
    ├── projects/         # Project management
    ├── databases/        # Database registry and browser
    │   └── [dbId]/       # Dynamic database routes
    │       └── tables/   # Table browser
    ├── audit-logs/       # Audit log viewer
    └── settings/         # User settings
```

## API Routes (`/app/api`)
RESTful API endpoints following Next.js conventions:
- `/api/auth/[...nextauth]` - NextAuth.js authentication
- `/api/databases` - Database CRUD operations
- `/api/projects` - Project management
- `/api/settings` - User settings and password changes

## Shared Components (`/components`)
Reusable UI components with clear naming:
- `DashboardLayout.tsx` - Main dashboard shell
- `*List.tsx` - Data listing components (DatabasesList, ProjectsList, etc.)
- `*Form.tsx` - Form components for CRUD operations
- `*Dialog.tsx` - Modal dialogs for confirmations and edits

## Library Code (`/lib`)
Core business logic and utilities:
- `auth.ts` - Authentication helpers and user management
- `db.ts` - Database connection management (internal + external)
- `encryption.ts` - Credential encryption/decryption
- `audit.ts` - Audit logging functionality

## Database Schema (`/database`)
- `schema.sql` - Complete PostgreSQL schema for internal dashboard database

## Type Definitions (`/types`)
- `next-auth.d.ts` - NextAuth.js type extensions

## Naming Conventions
- **Files**: PascalCase for components, kebab-case for pages
- **Components**: Descriptive names indicating purpose (e.g., `EditRowDialog`, `TableDataViewer`)
- **API Routes**: RESTful naming with HTTP methods in route handlers
- **Database**: Snake_case for tables/columns, following PostgreSQL conventions