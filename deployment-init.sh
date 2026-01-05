#!/bin/bash

echo "=== Database Dashboard Initialization ==="
echo ""

echo "1. SSH into your Coolify server or use Coolify's terminal"
echo "2. Find your container name:"
echo "   docker ps | grep stm-db"
echo ""

echo "3. Run these commands:"
echo "   docker exec -it YOUR_CONTAINER_NAME bash"
echo "   psql \$DATABASE_URL < database/schema.sql"
echo "   node scripts/create-admin.js"
echo ""

echo "4. Access your dashboard at: https://your-domain.coolify.app"
echo "5. Login with the admin credentials you created"