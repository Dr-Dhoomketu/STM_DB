# 🚀 Deployment Checklist

## Pre-Deployment Setup

### 1. Create Admin User
Before deploying, you need to create an admin user. Run this script:

```bash
# Create admin user script
node -e "
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function createAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  const email = 'admin@yourcompany.com'; // Change this
  const password = 'your-secure-password'; // Change this
  const hash = await bcrypt.hash(password, 10);
  
  await pool.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
    [email, hash, 'ADMIN']
  );
  
  console.log('Admin user created:', email);
  process.exit(0);
}

createAdmin().catch(console.error);
"
```

### 2. Environment Variables
Ensure these are set in Coolify:

```env
# Internal Dashboard Database
DATABASE_URL=postgresql://user:pass@db-host:5432/db_dashboard

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Encryption key for database credentials (32 bytes hex)
ENCRYPTION_KEY=your-32-byte-hex-key-here
```

### 3. Database Setup
```bash
# Run the schema
psql $DATABASE_URL < database/schema.sql
```

## Coolify Deployment

### 1. Docker Configuration
Your `Dockerfile` is ready for Coolify deployment.

### 2. Internal Network Access
Since you're on Coolify, you can connect to your website databases using their **service names** instead of IP addresses:

Example database registration:
- Host: `my-blog-db` (service name in Coolify)
- Port: `5432`
- Database: `blog_production`

### 3. HTTPS & Security
- Coolify will handle HTTPS automatically
- Your app will be accessible only to you (private)
- All database credentials are encrypted

## Post-Deployment

### 1. First Login
1. Go to `https://your-domain.com`
2. Login with your admin credentials
3. Register your first database

### 2. Register Databases
For each website database:
1. Go to Databases → Register Database
2. Use the Coolify service name as host
3. Set appropriate environment (prod/staging/dev)
4. Configure safety settings

### 3. Test Safety Features
1. Enable edit mode on a test database
2. Try editing a row
3. Verify the confirmation dialog works
4. Check audit logs are created

## Security Verification

✅ **Verify these work:**
- [ ] Login/logout
- [ ] Edit mode requires confirmation
- [ ] Production databases show warnings
- [ ] Audit logs capture all changes
- [ ] Edit mode expires after 30 minutes
- [ ] Non-admin users can't register databases

## 🎯 You're Ready!

Your database control panel is production-grade and ready to solve your multi-database management problem!