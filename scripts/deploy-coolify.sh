#!/bin/bash

echo "🚀 Database Control Panel - Coolify Deployment"
echo "=============================================="

# Generate secure secrets
echo "📝 Generating secure secrets..."

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "NEXTAUTH_SECRET generated"

# Generate encryption key (32 bytes hex)
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "ENCRYPTION_KEY generated"

# Generate database password
DB_PASSWORD=$(openssl rand -base64 16)
echo "DB_PASSWORD generated"

echo ""
echo "🔧 Environment Variables for Coolify:"
echo "======================================"
echo ""
echo "DATABASE_URL=postgresql://dbadmin:${DB_PASSWORD}@dashboard-db:5432/db_dashboard"
echo "NEXTAUTH_SECRET=${NEXTAUTH_SECRET}"
echo "NEXTAUTH_URL=https://your-domain.com"
echo "ENCRYPTION_KEY=${ENCRYPTION_KEY}"
echo "DB_PASSWORD=${DB_PASSWORD}"
echo ""
echo "⚠️  IMPORTANT:"
echo "1. Replace 'your-domain.com' with your actual domain"
echo "2. Copy these environment variables to Coolify"
echo "3. After deployment, create admin user with: docker exec -it container_name node scripts/create-admin.js"
echo ""