# 🔒 Secure PostgreSQL Web Editor Setup Guide

## 🎯 **What This Creates**

A secure web-based PostgreSQL database editor with:
- **OTP Authentication**: Email + password + 6-digit OTP verification
- **Safe Editing**: Read-only by default, explicit edit mode with YES confirmations
- **Audit Logging**: Every database change is logged with before/after data
- **Production Safety**: Designed for live database management

## 🚀 **Quick Setup (Local Development)**

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Setup Environment Variables**
Copy `.env.example` to `.env.local` and configure:

```env
# Internal Dashboard Database
DATABASE_URL=postgresql://dbadmin:your-db-password@localhost:5432/db_dashboard

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-here
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Gmail Configuration (for OTP)
EMAIL_FROM=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# OTP Configuration
OTP_EXPIRY_MINUTES=5

# Encryption key for database credentials (32 bytes hex)
ENCRYPTION_KEY=your-32-byte-hex-encryption-key

NODE_ENV=development
```

### 3. **Generate Secure Secrets**
```bash
# Generate JWT Secret
echo "JWT_SECRET=$(openssl rand -base64 32)"

# Generate NextAuth Secret  
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"

# Generate Encryption Key
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
```

### 4. **Setup Gmail App Password**
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use this password in `EMAIL_PASSWORD`

### 5. **Setup Database**
```bash
# Create database
createdb db_dashboard

# Run Prisma migrations
npm run db:migrate

# Create admin user
npm run db:create-admin
```

### 6. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` and test the OTP login flow!

## 🔐 **Security Features**

### **OTP Authentication Flow**
1. User enters email + password
2. System validates credentials
3. 6-digit OTP sent to Gmail
4. OTP expires in 5 minutes
5. OTP is hashed in database
6. JWT issued only after OTP verification
7. OTP is deleted after use (one-time)

### **Database Editing Safety**
1. All databases are read-only by default
2. User must explicitly enter "Edit Mode"
3. Changes are staged in memory (not saved)
4. Before saving: diff preview shown
5. User must type "YES" to confirm
6. All changes happen in database transactions
7. Every change is logged in audit table

### **Audit Logging**
Every database write logs:
- User email
- Table name
- Row ID
- Before data (JSON)
- After data (JSON)
- Timestamp
- IP address

## 🧪 **Testing Checklist**

Before deploying, verify:

- [ ] Register new user works
- [ ] Login requires OTP
- [ ] OTP arrives via Gmail
- [ ] Wrong OTP fails
- [ ] Correct OTP logs in
- [ ] Database view works (read-only)
- [ ] Edit mode requires YES confirmation
- [ ] Database changes persist
- [ ] Audit log entries created
- [ ] JWT stored in httpOnly cookie
- [ ] Logout clears JWT

## 🚀 **Production Deployment**

### **Environment Changes**
```env
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=postgresql://user:pass@prod-host:5432/db_dashboard
```

### **Deploy Commands**
```bash
# Build application
npm run build

# Deploy database schema
npm run db:deploy

# Start production server
npm start
```

## 🛡️ **Security Best Practices**

✅ **Never store OTP in plaintext**  
✅ **JWT in httpOnly cookies only**  
✅ **All database writes in transactions**  
✅ **Mandatory audit logging**  
✅ **OTP expiry and one-time use**  
✅ **No auto-save or SQL editor**  
✅ **Production-safe confirmations**  

## 🔧 **Troubleshooting**

### **OTP Not Received**
- Check Gmail App Password
- Verify EMAIL_FROM and EMAIL_PASSWORD
- Check spam folder
- Ensure 2FA enabled on Gmail

### **Database Connection Issues**
- Verify DATABASE_URL format
- Check PostgreSQL is running
- Ensure database exists
- Verify user permissions

### **JWT Issues**
- Check JWT_SECRET is set
- Verify cookie settings
- Clear browser cookies
- Check middleware configuration

## 📊 **Database Schema**

The system uses these tables:
- `users` - User accounts with hashed passwords
- `login_otps` - Temporary OTP storage (hashed)
- `projects` - Website/project organization
- `databases` - Registry of PostgreSQL databases
- `audit_logs` - Immutable audit trail

## 🎯 **Result**

A production-ready, secure PostgreSQL web editor that:
- Replaces SSH/psql access
- Prevents accidental data damage
- Enforces strong authentication
- Provides complete audit trails
- Can safely manage live databases

**Perfect for teams managing production PostgreSQL databases!** 🚀