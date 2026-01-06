# Database Administration Platform - System Overview

## 🎯 Architecture Summary

This is a **production-ready PostgreSQL database administration platform** that safely manages multiple databases from a single secure interface. The system replaces SSH/psql access with a web-based solution that enforces strict security controls.

## 🏗️ Core Architecture

### 1️⃣ Control Database (Internal)
- **Purpose**: Stores admin app data only
- **Technology**: PostgreSQL + Prisma ORM
- **Contains**: Users, OTP tokens, audit logs, database registry
- **Connection**: Single persistent connection pool

### 2️⃣ Website Databases (External)
- **Purpose**: Target databases being managed
- **Technology**: PostgreSQL (no code changes required)
- **Connection**: Dynamic per-request via `pg` library
- **Security**: Credentials encrypted at rest, never exposed to frontend

## 🔐 Security Architecture

### Multi-Layer Authentication
1. **Email + Password** - Standard login
2. **OTP Verification** - Email-based one-time password
3. **JWT Session** - Contains `otpVerified: true` flag
4. **Per-Request Verification** - Every DB write checks OTP status

### Database Credential Security
- **Encryption**: AES-256-GCM with random IV and auth tag
- **Key Management**: `DB_CREDENTIAL_ENCRYPTION_KEY` environment variable
- **Storage**: Encrypted passwords in control database
- **Access**: Decrypted only in backend memory, never logged or sent to frontend

### Write Protection
- **Default State**: All databases read-only
- **Edit Mode**: Explicit toggle with warning banners
- **Confirmation**: Must type "YES" (or "YES UPDATE PROD" for production)
- **Backend Enforcement**: Server validates confirmation, rejects API calls without it

## 🔄 Database Selection Flow

1. **User Login** → Email + Password + OTP verification
2. **Database List** → Backend fetches registered databases (names only)
3. **Selection** → User clicks "View Tables" for specific database
4. **Context** → Selected database ID stored in URL/session context
5. **Operations** → All queries apply only to selected database

## 📊 Data Flow Architecture

```
Frontend (Next.js)
    ↓ (Database names only, no credentials)
Control Database (Prisma)
    ↓ (Encrypted credentials retrieved)
Backend API Routes
    ↓ (Credentials decrypted in memory)
External Database (pg client)
    ↓ (Query results)
Audit Log (Transaction-safe)
```

## 🛡️ Security Guarantees

### ❌ Cannot Be Bypassed
- **Stolen Cookies**: OTP verification required for all writes
- **Direct API Calls**: Server-side OTP and confirmation enforcement
- **Frontend Manipulation**: All security checks happen server-side
- **Credential Exposure**: Passwords never leave backend, never logged

### ✅ Enforced Controls
- **Two-Factor Database Access**: Email + Password + OTP for writes
- **Human Confirmation**: "YES" typing required for all changes
- **Complete Audit Trail**: Every write logged with before/after data
- **Transaction Safety**: Audit log and DB write in same transaction

## 📁 Database Registry

The `databases` table stores:
- **Connection Info**: Host, port, database name, username
- **Encrypted Password**: AES-256-GCM encrypted
- **Environment**: dev/staging/prod classification
- **Permissions**: read_only, edit_enabled, extra_confirmation_required
- **Project Association**: Optional grouping by website/project

## 🔍 Table Browsing

### Read Operations
- **Table List**: Shows all tables with row/column counts
- **Data Viewer**: Paginated table data with search
- **Column Info**: Data types, nullable status
- **No Logging**: Read operations don't spam audit logs

### Write Operations
- **Edit Mode**: Explicit toggle with production warnings
- **Change Preview**: Shows before/after data
- **Confirmation**: Requires typing "YES" or "YES UPDATE PROD"
- **Audit Trail**: Complete logging with user, timestamp, IP

## 🧾 Audit System

Every database write creates an audit log entry containing:
- **User Info**: ID, email address
- **Database Info**: ID, name
- **Table Info**: Name, row ID
- **Change Data**: Complete before/after JSON
- **Metadata**: Timestamp, IP address, action type

**Transaction Safety**: Audit log creation and database write happen in the same transaction. If audit fails, database write is rolled back.

## 🚀 Deployment Model

### Single Application
- **One Coolify App**: Contains entire admin interface
- **One Control DB**: Internal PostgreSQL for app data
- **Many Target DBs**: External PostgreSQL databases being managed

### Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@host:5432/control_db
DB_CREDENTIAL_ENCRYPTION_KEY=32-byte-hex-key
JWT_SECRET=jwt-signing-key
EMAIL_FROM=admin@company.com
EMAIL_PASSWORD=gmail-app-password
NODE_ENV=production
```

## 🧪 Security Testing

The system includes comprehensive security tests:
- **Login without OTP** → Blocked
- **Database access without auth** → Blocked  
- **Write without OTP** → Blocked
- **Write without YES confirmation** → Blocked
- **Successful edit** → Audit log created
- **Credential exposure** → Never appears in frontend

## 📋 Production Checklist

✅ **OTP-verified sessions** - All DB writes require email OTP  
✅ **Backend YES confirmation** - Server enforces explicit confirmation  
✅ **Transaction-safe audit logs** - Guaranteed audit trail  
✅ **Encrypted credential storage** - AES-256-GCM at rest  
✅ **No security bypasses** - All checks server-side  
✅ **Production warnings** - Extra confirmation for prod databases  
✅ **Complete audit trail** - Every change logged with context  

## 🎯 Result

A **production-hardened PostgreSQL web editor** that:
- ✅ Replaces SSH/psql access safely
- ✅ Prevents all possible security bypasses  
- ✅ Enforces human confirmation for all writes
- ✅ Provides complete audit trails
- ✅ Can safely manage live production databases

The system is **enterprise-ready** and can be deployed immediately to manage multiple PostgreSQL databases with complete security and auditability.