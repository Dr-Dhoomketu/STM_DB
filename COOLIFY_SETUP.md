# Coolify Deployment Guide

This guide will help you deploy the Database Control Panel on Coolify and connect it to all your website databases.

## Overview

Instead of SSH'ing into each server to manage databases, you'll have one central dashboard where you can:
- View all your website databases in one place
- Browse tables and data
- Make safe edits with confirmation
- See full audit logs of all changes

## Step 1: Deploy on Coolify

### Option A: Deploy from Git Repository

1. Push this codebase to a Git repository (GitHub, GitLab, etc.)
2. In Coolify, create a new application
3. Connect your Git repository
4. Coolify will detect the Dockerfile automatically

### Option B: Manual Deployment

1. In Coolify, create a new application
2. Choose "Docker Compose" or "Dockerfile"
3. Point to this directory
4. Coolify will build using the included Dockerfile

## Step 2: Configure Environment Variables

In Coolify's environment variables section, set:

```bash
# Internal Dashboard Database (create a new PostgreSQL service in Coolify)
DATABASE_URL=postgresql://user:password@internal-db:5432/db_dashboard

# NextAuth Configuration
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://your-dashboard-domain.com

# Encryption Key (32 bytes hex)
ENCRYPTION_KEY=your-32-byte-hex-key-here
```

### Generate Secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY
openssl rand -hex 32
```

## Step 3: Set Up Internal Database

1. In Coolify, create a new PostgreSQL service for the dashboard
2. Name it something like `db-dashboard-db`
3. Use the connection string in `DATABASE_URL`
4. After deployment, run the schema:

```bash
# SSH into your Coolify server or use Coolify's terminal
psql $DATABASE_URL -f database/schema.sql
```

Or create a one-time init container/job in Coolify to run this.

## Step 4: Create Admin User

After the app is deployed, create your first admin user:

```bash
# SSH into the container or use Coolify's terminal
node scripts/create-admin.js admin@yourdomain.com your-secure-password
```

## Step 5: Connect Your Website Databases

For each website deployed on Coolify:

### Finding Database Connection Details

1. In Coolify, go to your website's service
2. Find the PostgreSQL database service linked to it
3. Get the connection details:
   - **Host**: Usually the service name (e.g., `website-db`)
   - **Port**: Usually `5432`
   - **Database Name**: The database name
   - **Username**: Database user
   - **Password**: Database password

### Register Database in Dashboard

1. Log into your Database Control Panel
2. Go to "Databases" → "Register Database"
3. Fill in:
   - **Name**: Friendly name (e.g., "My Blog Production")
   - **Project**: Create a project for each website
   - **Host**: The PostgreSQL service name from Coolify (e.g., `my-blog-db`)
   - **Port**: `5432`
   - **Database Name**: The actual database name
   - **Username**: Database username
   - **Password**: Database password
   - **Environment**: Choose `prod`, `staging`, or `dev`
   - **Settings**:
     - ✅ Read-only: Start with this enabled for safety
     - ✅ Edit enabled: Enable when you need to make changes
     - ✅ Extra confirmation: Always enable for production

### Coolify Internal Networking

Since all services are in the same Docker network, you can use:
- **Host**: The PostgreSQL service name (as it appears in Coolify)
- **Port**: `5432` (default PostgreSQL port)

Example:
- If your PostgreSQL service is named `my-blog-db` in Coolify
- Use `my-blog-db` as the host (not `localhost` or an IP)

## Step 6: Using the Dashboard

### Viewing Databases

1. Go to "Databases" to see all registered databases
2. Click "View Tables" on any database
3. Click on a table to view its data
4. Use search to find specific rows

### Making Edits

1. **Enable Edit Mode**: Toggle the switch (yellow warning appears)
2. **Edit Mode expires after 30 minutes** for safety
3. Click "Edit" on any row
4. Make your changes
5. Click "Preview Changes"
6. Review the diff (before/after)
7. Type **"YES"** to confirm (or **"YES UPDATE PROD"** for production)
8. Changes are saved and logged

### Safety Features

- **Read-only mode**: Prevents accidental changes
- **Edit mode timeout**: Auto-disables after 30 minutes
- **Confirmation required**: Must type "YES" exactly
- **Production protection**: Requires "YES UPDATE PROD" for prod databases
- **Full audit log**: Every change is logged with before/after data

## Step 7: Daily Workflow

### Before Making Changes

1. Check the database environment (prod/staging/dev)
2. Review recent audit logs
3. Enable edit mode only when needed
4. Make your changes
5. Review audit logs to confirm changes

### Best Practices

1. **Start with read-only**: Register databases as read-only first
2. **Use projects**: Group databases by website/project
3. **Test on staging**: Make changes on staging first
4. **Review audit logs**: Check what changed
5. **Disable edit mode**: Turn off when done

## Troubleshooting

### Can't Connect to Database

- Verify the PostgreSQL service name in Coolify
- Check if services are in the same Docker network
- Verify database credentials
- Check PostgreSQL logs in Coolify

### Connection Timeout

- Ensure the database service is running
- Verify network connectivity between services
- Check firewall rules in Coolify

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

## Security Notes

1. **Private Network**: All database connections happen server-side
2. **Encrypted Credentials**: Database passwords are encrypted at rest
3. **HTTPS Only**: Use HTTPS in production (Coolify handles this)
4. **Limited Access**: Only trusted team members should have access
5. **Audit Trail**: All changes are logged and immutable

## Example: Managing Multiple Websites

Let's say you have 3 websites on Coolify:

1. **My Blog** (production)
   - Database: `my-blog-db`
   - Register as: "My Blog - Production"

2. **My Shop** (production)
   - Database: `my-shop-db`
   - Register as: "My Shop - Production"

3. **My Blog Staging**
   - Database: `my-blog-staging-db`
   - Register as: "My Blog - Staging"

Create projects:
- "My Blog" → Assign both production and staging databases
- "My Shop" → Assign production database

Now you can:
- View all databases in one place
- Switch between websites easily
- Make edits with full safety controls
- See complete audit history

## Next Steps

1. Deploy the dashboard on Coolify
2. Register your first database
3. Test viewing data
4. Try a test edit (on staging first!)
5. Register all your website databases
6. Enjoy centralized database management! 🎉

