# Database Control Panel - Setup Guide

This guide will help you set up the Database Control Panel for production use.

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL database for the dashboard
- Access to PostgreSQL databases you want to manage
- OpenSSL (for generating encryption keys)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Internal Dashboard Database
DATABASE_URL=postgresql://user:password@localhost:5432/db_dashboard

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Encryption key for database credentials (32 bytes hex)
ENCRYPTION_KEY=your-32-byte-hex-encryption-key-here
```

### Generate Required Secrets

1. **NEXTAUTH_SECRET**: Generate a random secret:
   ```bash
   openssl rand -base64 32
   ```

2. **ENCRYPTION_KEY**: Generate a 32-byte hex key:
   ```bash
   openssl rand -hex 32
   ```

## Step 3: Create Dashboard Database

```bash
createdb db_dashboard
```

Or using psql:
```sql
CREATE DATABASE db_dashboard;
```

## Step 4: Initialize Database Schema

Run the schema SQL file:

```bash
psql db_dashboard < database/schema.sql
```

Or use the setup script:
```bash
chmod +x scripts/setup-db.sh
./scripts/setup-db.sh
```

## Step 5: Create Admin User

Create your first admin user:

```bash
node scripts/create-admin.js admin@example.com your-secure-password
```

**Important**: Use a strong password (at least 8 characters, preferably much longer).

## Step 6: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and log in with your admin credentials.

## Step 7: Register Your First Database

1. Log in to the dashboard
2. Navigate to "Databases"
3. Click "Register Database"
4. Fill in the connection details:
   - **Name**: A friendly name for this database
   - **Host**: Database hostname or IP
   - **Port**: Usually 5432
   - **Database Name**: The PostgreSQL database name
   - **Username**: Database user
   - **Password**: Database password (will be encrypted)
   - **Environment**: Choose dev/staging/prod
   - **Settings**: Configure read-only, edit enabled, etc.

## Production Deployment on Coolify

### 1. Build the Application

```bash
npm run build
```

### 2. Docker Configuration

The project includes a `Dockerfile` for containerized deployment. Coolify will use this automatically.

### 3. Environment Variables in Coolify

Set all environment variables in Coolify's environment configuration:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `ENCRYPTION_KEY`

### 4. Database Access

Ensure your Coolify deployment can access:
- The internal dashboard database
- All external databases you want to manage

Use internal Docker networking or VPN for secure database access.

### 5. HTTPS

Coolify should automatically handle HTTPS. Ensure `NEXTAUTH_URL` uses `https://`.

## Security Best Practices

1. **Never commit `.env.local` or `.env` files**
2. **Use strong passwords** for all admin accounts
3. **Enable read-only mode** for production databases initially
4. **Use extra confirmation** for production databases
5. **Regularly review audit logs**
6. **Limit admin access** to trusted team members only
7. **Use VPN or private networking** for database connections
8. **Rotate encryption keys** periodically (requires re-encrypting all passwords)

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running and accessible
- Ensure firewall rules allow connections

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your deployment URL
- Clear browser cookies and try again

### Encryption Errors

- Ensure `ENCRYPTION_KEY` is exactly 32 bytes (64 hex characters)
- Never change the encryption key after databases are registered (passwords will be unreadable)

## Support

For issues or questions, check the audit logs first - they contain detailed information about all operations.

