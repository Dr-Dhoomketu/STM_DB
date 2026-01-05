# Local Setup Guide

Follow these steps to run the Database Control Panel locally.

## Prerequisites

- Node.js 20+ installed
- PostgreSQL installed and running
- Access to create databases

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

The `.env.local` file should already exist. Verify it has:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_dashboard
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
ENCRYPTION_KEY=your-32-byte-hex-key-here
```

**Update `DATABASE_URL`** with your PostgreSQL credentials if different.

## Step 3: Create Database and Run Setup

### Option A: Automated Setup Script

```bash
./setup-local.sh
```

This will:
- Create the database
- Run the schema
- Create an admin user

### Option B: Manual Setup

#### 3a. Create Database

```bash
# If you have postgres user access
createdb db_dashboard

# OR using psql
psql -U postgres -c "CREATE DATABASE db_dashboard;"

# OR if you need sudo
sudo -u postgres createdb db_dashboard
```

#### 3b. Run Schema

```bash
psql db_dashboard < database/schema.sql

# OR with specific user
psql -U postgres -d db_dashboard -f database/schema.sql

# OR with sudo
sudo -u postgres psql db_dashboard < database/schema.sql
```

#### 3c. Create Admin User

```bash
node scripts/create-admin.js admin@example.com your-password
```

## Step 4: Start Development Server

```bash
npm run dev
```

The server will start at **http://localhost:3000**

## Step 5: Log In

1. Open http://localhost:3000
2. You'll be redirected to the login page
3. Use the admin credentials you created

## Troubleshooting

### "Database does not exist"

Make sure you've created the database:
```bash
createdb db_dashboard
# OR
psql -U postgres -c "CREATE DATABASE db_dashboard;"
```

### "Password authentication failed"

Update `DATABASE_URL` in `.env.local` with correct credentials:
```bash
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/db_dashboard
```

### "Connection refused"

Make sure PostgreSQL is running:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if needed
sudo systemctl start postgresql
```

### "Permission denied" when creating database

Try with your current user:
```bash
createdb db_dashboard
```

Or create a PostgreSQL user for yourself:
```bash
sudo -u postgres createuser -s $USER
createdb db_dashboard
```

## Next Steps

Once running locally:

1. **Test the interface** - Browse around
2. **Register a test database** - Add one of your website databases
3. **Try viewing data** - Browse tables
4. **Test editing** - Make a test edit (on a non-production DB!)
5. **Check audit logs** - See your changes logged

## Ready for Production?

Once you've tested locally, follow `COOLIFY_SETUP.md` to deploy on Coolify!

