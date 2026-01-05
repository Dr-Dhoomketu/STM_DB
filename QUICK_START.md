# 🚀 Quick Start Guide

## **Goal: Manage All Your PostgreSQL Databases from One Dashboard**

### **1. Push to GitHub** (2 minutes)
```bash
git init
git add .
git commit -m "Database Control Panel"
git remote add origin https://github.com/yourusername/db-dashboard.git
git push -u origin main
```

### **2. Deploy on Coolify** (5 minutes)
1. **New Application** → **GitHub Repository**
2. Select your `db-dashboard` repo
3. **Build Method**: Dockerfile
4. **Environment Variables**:
   ```env
   DATABASE_URL=postgresql://dbadmin:your-password@db-dashboard-db:5432/db_dashboard
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=https://your-domain.coolify.app
   ENCRYPTION_KEY=your-32-byte-hex-key
   ```
5. **Deploy**

### **3. Set Up Database** (3 minutes)
```bash
# In Coolify terminal or SSH
docker exec -it your-container bash
psql $DATABASE_URL < database/schema.sql
node scripts/create-admin.js
```

### **4. Add Your Databases** (2 minutes each)
Login to your dashboard and register your databases:

**WordPress Blog:**
- Host: `myblog-db` (Coolify service name)
- Database: `wordpress`
- Website: `https://myblog.com`

**E-commerce Store:**
- Host: `store-db` (Coolify service name)  
- Database: `woocommerce`
- Website: `https://mystore.com`

**Custom App:**
- Host: `myapp-db` (Coolify service name)
- Database: `myapp`
- Website: `https://myapp.com`

## **🎯 Result**
✅ **One dashboard** for all your PostgreSQL databases  
✅ **Visual table browser** with search and pagination  
✅ **Safe editing** with mandatory confirmations  
✅ **See which website** each database serves  
✅ **Complete audit trail** of all changes  
✅ **No more SSH** into servers!  

## **🔧 Generate Secrets**
```bash
# NextAuth Secret
openssl rand -base64 32

# Encryption Key (32 bytes hex)
openssl rand -hex 32
```

**Total Setup Time: ~15 minutes**  
**Result: Professional database management for all your Coolify websites!** 🎉