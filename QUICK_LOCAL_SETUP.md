# Quick Local Setup

## Run These Commands

### 1. Create PostgreSQL User (if needed)

```bash
sudo -u postgres createuser -s $USER
```

### 2. Create Database

```bash
createdb db_dashboard
```

### 3. Run Schema

```bash
psql db_dashboard < database/schema.sql
```

### 4. Create Admin User

```bash
node scripts/create-admin.js admin@example.com admin123
```

### 5. Start Server (if not running)

```bash
npm run dev
```

### 6. Open Browser

Visit: **http://localhost:3000**

Login with:
- Email: `admin@example.com`
- Password: `admin123`

## If Commands Don't Work

### Alternative: Use postgres user directly

Update `.env.local` to use postgres user, then:

```bash
# Create database
sudo -u postgres createdb db_dashboard

# Run schema
sudo -u postgres psql db_dashboard < database/schema.sql

# Create admin (update DATABASE_URL in .env.local first)
node scripts/create-admin.js admin@example.com admin123
```

### Check PostgreSQL is Running

```bash
sudo systemctl status postgresql
# OR
sudo service postgresql status
```

