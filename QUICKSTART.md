# Quick Start Guide

## Step 1: Set Up PostgreSQL Database

Create the dashboard database and run the schema:

```bash
# Option 1: If you have postgres user access
createdb db_dashboard
psql db_dashboard < database/schema.sql

# Option 2: Using sudo (if needed)
sudo -u postgres createdb db_dashboard
sudo -u postgres psql db_dashboard < database/schema.sql

# Option 3: Using psql directly
psql -U your_username -d postgres -c "CREATE DATABASE db_dashboard;"
psql -U your_username -d db_dashboard -f database/schema.sql
```

## Step 2: Update .env.local

Edit `.env.local` and update the `DATABASE_URL` with your PostgreSQL credentials:

```bash
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/db_dashboard
```

## Step 3: Create Admin User

```bash
node scripts/create-admin.js admin@example.com your-secure-password
```

## Step 4: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and log in!

