#!/usr/bin/env node

/**
 * Script to create an admin user for the secure database editor
 * Uses Prisma for database operations
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function questionHidden(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    process.stdin.on('data', function(char) {
      char = char + '';
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function createAdmin() {
  try {
    console.log('🔐 Secure Database Editor - Admin User Creation\n');

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.log('Please set DATABASE_URL and try again.');
      console.log('Example: DATABASE_URL=postgresql://user:pass@host:5432/dbname');
      process.exit(1);
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful\n');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('\n💡 Make sure:');
      console.log('1. PostgreSQL is running');
      console.log('2. Database exists');
      console.log('3. DATABASE_URL is correct');
      console.log('4. Run: npm run db:migrate');
      process.exit(1);
    }

    // Get user input
    const email = await question('Enter admin email: ');
    if (!email || !email.includes('@')) {
      console.error('❌ Please enter a valid email address');
      process.exit(1);
    }

    const password = await questionHidden('Enter admin password: ');
    if (!password || password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.error(`❌ User with email ${email} already exists`);
      process.exit(1);
    }

    // Hash password and create user
    console.log('\n🔄 Creating admin user...');
    const passwordHash = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n🔒 IMPORTANT SECURITY NOTES:');
    console.log('1. Change this password after first login');
    console.log('2. OTP will be sent to this email for login');
    console.log('3. Make sure Gmail App Password is configured');
    console.log('\n🎉 You can now login to the secure database editor!');
    console.log(`   URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`);

    rl.close();
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();