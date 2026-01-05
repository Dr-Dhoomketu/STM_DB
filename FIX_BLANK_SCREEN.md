# Fix Blank Screen Issue

## The Problem
- Next.js is running on **port 3001** (port 3000 is in use)
- Database connection is failing
- This causes a blank screen or errors

## Quick Fix

### Step 1: Access the Correct Port
Open: **http://localhost:3001** (NOT 3000)

### Step 2: Set Up Database

Run these commands:

```bash
# Create PostgreSQL user (if needed)
sudo -u postgres createuser -s $USER

# Create the database
createdb db_dashboard

# Run the schema
psql db_dashboard < database/schema.sql

# Create admin user
node scripts/create-admin.js admin@example.com admin123
```

### Step 3: If Database Connection Still Fails

Update `.env.local` with correct PostgreSQL credentials:

```bash
# Edit .env.local
nano .env.local

# Update DATABASE_URL to match your PostgreSQL setup
# Examples:
# DATABASE_URL=postgresql://your_username:your_password@localhost:5432/db_dashboard
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_dashboard
```

### Step 4: Restart Server

```bash
# Kill existing server
pkill -f "next dev"

# Start fresh
npm run dev
```

### Step 5: Open Browser

Visit: **http://localhost:3001**

Login with:
- Email: `admin@example.com`
- Password: `admin123`

## Alternative: Use Port 3000

If you want to use port 3000, kill whatever is using it:

```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill it (replace PID with actual process ID)
kill -9 <PID>

# Start Next.js
npm run dev
```

## Check Server Logs

If still having issues, check the terminal where `npm run dev` is running for error messages.

