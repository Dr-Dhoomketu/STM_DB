# Database Control Panel - Architecture

## Overview

This is a production-grade private web application for viewing and safely editing data across multiple PostgreSQL databases. It's designed for internal DevOps use by a small trusted team.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth.js v5 (Credentials Provider)
- **Database**: PostgreSQL (node-postgres/pg)
- **Styling**: Tailwind CSS
- **Password Hashing**: bcryptjs
- **Encryption**: Node.js crypto (AES-256-GCM)

## Architecture

### Database Structure

#### Internal Dashboard Database
Stores application metadata:
- `users` - Admin and viewer accounts
- `projects` - Website/project registry
- `databases` - External database registry with encrypted credentials
- `audit_logs` - Immutable audit trail

#### External Databases
PostgreSQL databases managed by the system:
- Connected dynamically using stored credentials
- Credentials encrypted at rest
- Never exposed to frontend

### Security Layers

1. **Authentication**
   - Email + password login
   - Session-based (JWT)
   - No public signup
   - Protected routes via middleware

2. **Authorization**
   - Role-based: ADMIN (full access) or VIEWER (read-only)
   - Per-database permissions (read-only, edit enabled)
   - Production lock with extra confirmation

3. **Data Protection**
   - Database passwords encrypted with AES-256-GCM
   - Encryption key stored in environment variable
   - Credentials never sent to frontend
   - All database operations server-side only

4. **Edit Safety**
   - Edit mode must be explicitly enabled
   - Auto-expires after 30 minutes
   - Mandatory preview before changes
   - Confirmation required: "YES" (or "YES UPDATE PROD" for production)
   - Full diff shown before confirmation

5. **Audit Logging**
   - Every edit logged with before/after data
   - User, timestamp, IP address recorded
   - Immutable logs (no updates/deletes)
   - Viewable by all authenticated users

## Key Features

### 1. Dashboard Home
- Overview statistics
- Quick navigation
- Recent activity summary

### 2. Projects Management
- Create/manage projects (websites)
- Assign databases to projects
- Organizational structure

### 3. Database Registry
- Register new PostgreSQL databases
- Encrypt and store credentials
- Configure permissions and safety settings
- No code changes needed for new databases

### 4. Table Browser
- Dynamic table discovery
- Row count display
- Click to view table data

### 5. Table Data Viewer
- Paginated data display
- Column type detection
- Search across all columns
- Read-only by default

### 6. Edit Mode
- Explicit toggle to enable
- Warning banners
- Auto-expiration (30 min)
- Edit individual rows
- Preview changes with diff
- Mandatory confirmation

### 7. Audit Logs
- Filterable by database, action, date
- View before/after data
- Immutable record
- Full user attribution

### 8. Settings
- Change password
- Session management

## Data Flow

### Viewing Data
1. User navigates to database → table
2. Server fetches database config (decrypts password)
3. Server connects to external database
4. Server queries table data
5. Data displayed (read-only)
6. Connection closed

### Editing Data
1. User enables edit mode (with warning)
2. User clicks "Edit" on a row
3. User modifies fields
4. User clicks "Preview Changes"
5. System shows diff (before/after)
6. User must type "YES" (or "YES UPDATE PROD" for prod)
7. Server validates confirmation
8. Server connects to external database
9. Server executes UPDATE query
10. Server logs audit event
11. Connection closed
12. UI refreshes

## Security Considerations

### Production Deployment
- Use HTTPS only
- Store secrets in environment variables
- Use private networking for database access
- Regular security audits
- Monitor audit logs
- Limit admin access

### Database Connections
- Connections created per-request
- Properly closed after use
- Timeout protection (5s connection, 10s idle)
- No connection pooling for external DBs (security)

### Error Handling
- Errors logged server-side
- Generic error messages to frontend
- No sensitive data in error responses
- Audit logs capture failures

## File Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── databases/    # Database operations
│   │   ├── projects/     # Project management
│   │   └── settings/     # User settings
│   ├── dashboard/        # Dashboard pages
│   │   ├── databases/    # Database management
│   │   ├── projects/     # Project management
│   │   ├── audit-logs/   # Audit log viewer
│   │   └── settings/     # Settings page
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── DashboardLayout.tsx
│   ├── TableDataViewer.tsx
│   ├── EditRowDialog.tsx
│   └── ...
├── lib/                  # Utility libraries
│   ├── db.ts            # Database connections
│   ├── auth.ts          # Authentication
│   ├── encryption.ts    # Encryption utilities
│   └── audit.ts         # Audit logging
├── database/             # Database schema
│   └── schema.sql
├── scripts/              # Utility scripts
│   ├── create-admin.js
│   └── setup-db.sh
├── middleware.ts         # Route protection
└── types/               # TypeScript types
    └── next-auth.d.ts
```

## Deployment

### Coolify
The application is configured for Coolify deployment:
- Dockerfile included
- Standalone output mode
- Environment variable configuration
- Internal Docker networking support

### Environment Variables Required
- `DATABASE_URL` - Internal dashboard database
- `NEXTAUTH_SECRET` - NextAuth session secret
- `NEXTAUTH_URL` - Application URL
- `ENCRYPTION_KEY` - 32-byte hex key for credential encryption

## Future Enhancements

Potential improvements:
- INSERT row functionality
- Soft-delete support
- Export data to CSV/JSON
- Database connection testing
- Query builder interface
- Scheduled backups
- Multi-factor authentication
- API key authentication
- Webhook notifications for changes

## License

Private/internal use only.

