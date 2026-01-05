#!/bin/bash

echo "=== Generate Secure Secrets for Deployment ==="
echo ""

echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo ""

echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
echo ""

echo "DB_PASSWORD=$(openssl rand -base64 16)"
echo ""

echo "Copy these values to your Coolify environment variables!"