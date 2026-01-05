#!/bin/bash

# Local Setup Script for Database Control Panel
# This script sets up the database and creates an admin user

set -e

echo "🚀 Setting up Database Control Panel locally..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your database credentials"
    exit 1
fi

# Source environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Extract database name from DATABASE_URL
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo "📊 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Check if database exists
echo "🔍 Checking if database exists..."
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
    echo "✅ Database '$DB_NAME' already exists"
else
    echo "📦 Creating database '$DB_NAME'..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME"
    echo "✅ Database created"
fi

# Run schema
echo "📋 Running database schema..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/schema.sql
echo "✅ Schema applied"

# Create admin user
echo ""
echo "👤 Creating admin user..."
echo "Enter email for admin user (default: admin@example.com):"
read -r ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@example.com}

echo "Enter password for admin user (default: admin123):"
read -rs ADMIN_PASSWORD
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
echo ""

node scripts/create-admin.js "$ADMIN_EMAIL" "$ADMIN_PASSWORD"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Make sure the dev server is running: npm run dev"
echo "   2. Visit http://localhost:3000"
echo "   3. Log in with: $ADMIN_EMAIL / [your password]"
echo ""

