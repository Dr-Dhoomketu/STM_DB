# 🚀 Coolify Deployment Guide

## Quick Deployment Steps

### 1. **Generate Environment Variables**
```bash
./scripts/deploy-coolify.sh
```
This will generate secure secrets for your deployment.

### 2. **Deploy to Coolify**

1. **Create New Application** in Coolify
   - Choose "Docker Compose" deployment
   - Connect your Git repository
   - Set branch to `main`

2. **Set Environment Variables** in Coolify:
   ```env
   DATABASE_URL=postgresql://dbadmin:YOUR_DB_PASSWORD@dashboard-db:5432/db_dashboard
   NEXTAUTH_SECRET=your-generated-secret
   NEXTAUTH_URL=https://your-domain.com
   ENCRYPTION_KEY=your-generated-encryption-key
   DB_PASSWORD=your-generated-db-password
   ```

3. **Deploy** - Coolify will build and start your containers

### 3. **Post-Deployment Setup**

1. **Create Admin User**:
   ```bash
   # SSH into your Coolify server
   docker exec -it your-container-name node scripts/create-admin.js
   ```

2. **Access Your Dashboard**:
   - Go to `https://your-domain.com`
   - Login with your admin credentials

### 4. **Register Your Databases**

In the dashboard, go to **Databases** → **Register Database** and add your Coolify databases:

#### Example for a WordPress Blog:
- **Name**: `My Blog Database`
- **Website URL**: `https://myblog.com`
- **Description**: `WordPress blog database`
- **Host**: `myblog-db` ← **Use Coolify service name**
- **Port**: `5432`
- **Database Name**: `wordpress`
- **Username**: `wordpress_user`
- **Password**: `your-actual-db-password`
- **Environment**: `Production`

#### Example for an E-commerce Store:
- **Name**: `Store Database`
- **Website URL**: `https://mystore.com`
- **Description**: `E-commerce database with products and orders`
- **Host**: `store-db` ← **Use Coolify service name**
- **Port**: `5432`
- **Database Name**: `ecommerce`
- **Username**: `store_user`
- **Password**: `your-actual-db-password`
- **Environment**: `Production`

## 🔧 **Key Points for Coolify**

### **Service Names as Hosts**
Instead of IP addresses, use your Coolify service names:
- ✅ `myblog-db` (Coolify service name)
- ❌ `192.168.1.100` (IP address)

### **Internal Network**
All services in Coolify can communicate using service names because they're on the same Docker network.

### **Database Passwords**
Get your actual database passwords from:
1. Coolify dashboard → Your database service → Environment variables
2. Or from your database service configuration

### **Security**
- All database credentials are encrypted before storage
- Only admins can register new databases
- Production databases require extra confirmation for edits

## 🎯 **Result**

After deployment, you'll have:
- ✅ Secure web interface at your domain
- ✅ All your PostgreSQL databases in one dashboard
- ✅ Visual table browser with search and pagination
- ✅ Safe editing with mandatory confirmations
- ✅ Complete audit trail of all changes
- ✅ No more SSH needed for database management!

## 🔍 **Troubleshooting**

### Connection Issues
1. Verify service names match your Coolify services
2. Check database passwords are correct
3. Ensure databases are running and accessible

### Permission Issues
1. Make sure database users have proper permissions
2. Check if databases allow connections from other containers

### Environment Variables
1. Verify all required environment variables are set
2. Check NEXTAUTH_URL matches your actual domain
3. Ensure ENCRYPTION_KEY is exactly 32 bytes (64 hex characters)