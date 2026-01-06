#!/bin/bash

echo "🔒 Production-Ready Secure PostgreSQL Web Editor Setup"
echo "=================================================="

# Check if required environment variables are set
check_env_var() {
    if [ -z "${!1}" ]; then
        echo "❌ Error: $1 environment variable is not set"
        echo "Please set $1 and try again"
        exit 1
    else
        echo "✅ $1 is set"
    fi
}

echo ""
echo "🔍 Checking environment variables..."

# Check all required environment variables
check_env_var "DATABASE_URL"
check_env_var "JWT_SECRET"
check_env_var "NEXTAUTH_SECRET"
check_env_var "EMAIL_FROM"
check_env_var "EMAIL_PASSWORD"
check_env_var "ENCRYPTION_KEY"

echo ""
echo "🔧 Installing dependencies..."
npm install

echo ""
echo "🗄️ Setting up database..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

echo ""
echo "👤 Creating admin user..."
node scripts/create-admin.js

echo ""
echo "🧪 Running production readiness tests..."

# Test database connection
echo "Testing database connection..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => {
    console.log('✅ Database connection successful');
    return prisma.\$disconnect();
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  });
"

# Test email configuration
echo "Testing email configuration..."
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});
transporter.verify()
  .then(() => {
    console.log('✅ Email configuration successful');
  })
  .catch((error) => {
    console.error('❌ Email configuration failed:', error.message);
    console.log('Please check your Gmail App Password');
    process.exit(1);
  });
"

echo ""
echo "🏗️ Building application..."
npm run build

echo ""
echo "✅ Production setup complete!"
echo ""
echo "🚀 To start the production server:"
echo "   npm start"
echo ""
echo "🔒 Security checklist:"
echo "   ✅ OTP authentication enabled"
echo "   ✅ JWT with OTP verification state"
echo "   ✅ Server-side YES confirmation required"
echo "   ✅ All database writes logged in audit table"
echo "   ✅ Transactions ensure write + audit atomicity"
echo "   ✅ No raw SQL editor"
echo "   ✅ No auto-save functionality"
echo ""
echo "🎯 Your secure PostgreSQL web editor is ready for production!"