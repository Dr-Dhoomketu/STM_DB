#!/bin/bash

# Setup script for initializing the dashboard database
# Usage: ./scripts/setup-db.sh

set -e

echo "Setting up database schema..."

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Run schema SQL
psql "$DATABASE_URL" -f database/schema.sql

echo "Database schema created successfully!"
echo ""
echo "Next steps:"
echo "1. Create an admin user: node scripts/create-admin.js <email> <password>"
echo "2. Generate an encryption key: openssl rand -hex 32"
echo "3. Set ENCRYPTION_KEY in your .env file"

