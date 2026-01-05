# 🚀 GitHub + Coolify Deployment Guide

## **Why GitHub + Coolify is Better**

✅ **Automatic deployments** when you push to GitHub  
✅ **Environment variables** managed securely in Coolify dashboard  
✅ **No sensitive data** in your repository  
✅ **Easy updates** - just push to GitHub  
✅ **Version control** for all your changes  

## **Step 1: Push to GitHub**

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Database Control Panel"
   git branch -M main
   git remote add origin https://github.com/yourusername/db-dashboard.git
   git push -u origin main
   ```

## **Step 2: Deploy in Coolify**

### **Create New Application**
1. Go to your Coolify dashboard
2. Click **"New Application"**
3. Choose **"GitHub Repository"**
4. Select your `db-dashboard` repository
5. Set branch to `main`
6. Choose **"Dockerfile"** as build method

### **Set Environment Variables**
In Coolify dashboard, add these environment variables:

```env
# Internal Dashboard Database (Coolify will create this)
DATABASE_URL=postgresql://dbadmin:your-secure-password@db-dashboard-db:5432/db_dashboard

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.coolify.app

# Encryption Key (32 bytes hex - generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your-32-byte-hex-key-here

# Node Environment
NODE_ENV=production
```

### **Generate Secure Secrets**
Run this locally to generate secure values:
```bash
# Generate NextAuth Secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"

# Generate Encryption Key
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"

# Generate Database Password
echo "DB_PASSWORD=$(openssl rand -base64 16)"
```

## **Step 3: Set Up Database**

### **Option A: Use Coolify's PostgreSQL Service**
1. In Coolify, create a new **PostgreSQL** service
2. Name it `db-dashboard-db`
3. Set database name: `db_dashboard`
4. Set username: `dbadmin`
5. Set password: (use the generated password)
6. Connect it to your app's network

### **Option B: Use External PostgreSQL**
If you have an existing PostgreSQL server:
```env
DATABASE_URL=postgresql://username:password@your-postgres-host:5432/db_dashboard
```

## **Step 4: Initialize Database**

After deployment, run the database setup:

```bash
# SSH into your Coolify server or use Coolify's terminal
docker exec -it your-app-container-name bash

# Run database schema
psql $DATABASE_URL < database/schema.sql

# Create admin user
node scripts/create-admin.js
```

## **Step 5: Register Your Actual Databases**

Now the **main goal** - add your PostgreSQL databases:

### **Example: WordPress Blog Database**
- **Name**: `My WordPress Blog`
- **Website URL**: `https://myblog.com`
- **Description**: `WordPress blog with posts and users`
- **Host**: `myblog-db` ← **Coolify service name**
- **Port**: `5432`
- **Database**: `wordpress`
- **Username**: `wp_user`
- **Password**: `your-actual-wp-password`
- **Environment**: `Production`

### **Example: E-commerce Store**
- **Name**: `Online Store Database`
- **Website URL**: `https://mystore.com`
- **Description**: `WooCommerce store with products and orders`
- **Host**: `store-db` ← **Coolify service name**
- **Port**: `5432`
- **Database**: `woocommerce`
- **Username**: `store_user`
- **Password**: `your-actual-store-password`
- **Environment**: `Production`

### **Example: Custom App Database**
- **Name**: `My App Backend`
- **Website URL**: `https://myapp.com`
- **Description**: `Custom application database`
- **Host**: `myapp-db` ← **Coolify service name**
- **Port**: `5432`
- **Database**: `myapp`
- **Username**: `app_user`
- **Password**: `your-actual-app-password`
- **Environment**: `Production`

## **🎯 Main Goal Achieved**

After setup, you can:

✅ **View all your databases** in one dashboard  
✅ **Browse tables** from all your websites  
✅ **See which website** each database serves  
✅ **Search and filter** data across databases  
✅ **Safely edit** data with confirmations  
✅ **Track all changes** in audit logs  
✅ **No more SSH** into servers!  

## **🔄 Updates & Maintenance**

### **Deploy Updates**
Just push to GitHub - Coolify will automatically redeploy:
```bash
git add .
git commit -m "Update feature"
git push
```

### **Environment Variables**
Update in Coolify dashboard, then restart the application.

### **Database Backups**
Your dashboard database and all registered databases can be backed up through Coolify.

## **🛡️ Security Benefits**

- ✅ **No credentials in code** - all in Coolify environment
- ✅ **Encrypted database passwords** - stored securely
- ✅ **HTTPS enforced** - secure connections
- ✅ **Audit logging** - track all changes
- ✅ **Role-based access** - control who can edit

## **🎉 Result**

You now have a **professional database management system** that:
- Connects to all your Coolify PostgreSQL databases
- Shows which website each database serves
- Provides safe, visual database management
- Eliminates the need for SSH and command-line tools
- Tracks all changes for compliance and debugging

**Perfect for managing multiple websites on Coolify!** 🚀