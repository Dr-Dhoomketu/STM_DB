#!/usr/bin/env node

/**
 * Script to create an admin user for the database control panel
 * Works with environment variables (production-ready)
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const readline = require('readline');

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
    console.log('🔐 Database Control Panel - Admin User Creation\n');

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.log('Please set DATABASE_URL and try again.');
      console.log('Example: DATABASE_URL=postgresql://user:pass@host:5432/dbname');
      process.exit(1);
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Test database connection
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connection successful\n');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('\n💡 Make sure:');
      console.log('1. PostgreSQL is running');
      console.log('2. Database exists');
      console.log('3. DATABASE_URL is correct');
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
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.error(`❌ User with email ${email} already exists`);
      process.exit(1);
    }

    // Hash password and create user
    console.log('\n🔄 Creating admin user...');
    const hash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hash, 'ADMIN']
    );

    const user = result.rows[0];
    console.log('✅ Admin user created successfully!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n🎉 You can now login to the database control panel!');
    console.log(`   URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`);

    await pool.end();
    rl.close();
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();