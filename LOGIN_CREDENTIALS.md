# Login Credentials for Local Development

## Default Admin Credentials

After creating an admin user, use these credentials to log in:

**Email:** `admin@example.com`  
**Password:** `admin123`

## How to Create Admin User

Run this command in your terminal:

```bash
node scripts/create-admin.js admin@example.com admin123
```

You can use any email and password you want:

```bash
node scripts/create-admin.js your-email@example.com your-password
```

## First Time Setup

If you haven't set up the database yet, run these commands first:

```bash
# 1. Create database
createdb db_dashboard

# 2. Run schema
psql db_dashboard < database/schema.sql

# 3. Create admin user
node scripts/create-admin.js admin@example.com admin123
```

## Access the App

1. Open: **http://localhost:3001** (or 3000 if available)
2. Enter your email and password
3. Click "Sign in"

## Change Password Later

After logging in, go to **Settings** → **Change Password** to set a new password.

