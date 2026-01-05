# Database Control Panel

**Stop SSH'ing into servers to manage databases!** 

A secure, private web application that lets you view and safely edit data across **all your PostgreSQL databases** from one central dashboard. Perfect for managing multiple websites deployed on Coolify.

## The Problem It Solves

You have multiple websites on Coolify, each with their own PostgreSQL database. Currently you have to:
- SSH into each server
- Use psql command line
- Switch between terminals
- Risk making mistakes with no undo

## The Solution

**One secure web interface** to:
- ✅ View all your website databases in one place
- ✅ Browse tables and data visually
- ✅ Make safe edits with confirmation
- ✅ See full audit logs of all changes
- ✅ No SSH or command line needed

## Features

- 🔐 Secure authentication with role-based access control
- 🗄️ Multi-database support - register unlimited databases
- 📊 Table browser with pagination and search
- ✏️ Safe edit mode with mandatory confirmation ("YES" or "YES UPDATE PROD")
- 📝 Full audit logging - every change is tracked
- 🛡️ Production database protection
- 🔒 Encrypted credentials - passwords never exposed
- ⏱️ Auto-expiring edit mode (30 min timeout)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (copy `.env.example` to `.env`):
```bash
cp .env.example .env
```

3. Create the internal dashboard database and run migrations:
```bash
# Create database
createdb db_dashboard

# Run the SQL schema from database/schema.sql
psql db_dashboard < database/schema.sql
```

4. Create an admin user (run in Node REPL or create a script):
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('your-password', 10);
// Insert into users table with role 'ADMIN'
```

5. Run the development server:
```bash
npm run dev
```

## Security

- All database credentials are encrypted at rest
- Credentials never reach the frontend
- Mandatory confirmation for all edits
- Production databases require extra confirmation
- Full audit trail of all changes

## Quick Start for Coolify

1. **Deploy on Coolify** - See `COOLIFY_SETUP.md` for detailed instructions
2. **Register your databases** - Add each website's PostgreSQL database
3. **Start managing** - View and edit all databases from one interface

See `USAGE_GUIDE.md` for how to use the dashboard day-to-day.

## Deployment

This application is designed to be deployed on Coolify with:
- Internal Docker networking (connect to other Coolify services)
- HTTPS enforcement
- Isolated dashboard database
- Private access to external databases

**Key Point**: Since all services are in Coolify's Docker network, you can connect to your website databases using their **service names** (e.g., `my-blog-db`) instead of IP addresses.

