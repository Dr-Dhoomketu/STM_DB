#!/usr/bin/env node

/**
 * Script to set up sample databases and data for the database control panel
 * This creates 3 sample PostgreSQL databases with realistic data
 */

const { Pool } = require('pg');
const crypto = require('crypto');

// Simple encryption function (matching the one in lib/encryption.ts)
function encrypt(text) {
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '29961123fb7ccb0db3e907dbfc8bce8dce14433fd8c7ecb65ee177ae523d6d80', 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

// Sample database configurations
const sampleDatabases = [
  {
    name: 'E-Commerce Store',
    host: 'localhost',
    port: 5432,
    database_name: 'ecommerce_db',
    username: 'dbadmin',
    password: 'dbadmin123',
    environment: 'prod',
    description: 'Main e-commerce platform database'
  },
  {
    name: 'Blog Platform',
    host: 'localhost',
    port: 5432,
    database_name: 'blog_db',
    username: 'dbadmin',
    password: 'dbadmin123',
    environment: 'staging',
    description: 'Content management system for blog'
  },
  {
    name: 'Analytics Dashboard',
    host: 'localhost',
    port: 5432,
    database_name: 'analytics_db',
    username: 'dbadmin',
    password: 'dbadmin123',
    environment: 'dev',
    description: 'User analytics and reporting system'
  }
];

async function createSampleDatabase(dbName, sampleData) {
  console.log(`\n📊 Creating sample database: ${dbName}`);
  
  // Create database using postgres superuser
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  try {
    await execAsync(`sudo -u postgres createdb ${dbName}`);
    console.log(`✅ Database ${dbName} created`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`ℹ️  Database ${dbName} already exists`);
    } else {
      console.log(`ℹ️  Database ${dbName} might already exist, continuing...`);
    }
  }
  
  // Grant permissions to dbadmin
  try {
    await execAsync(`sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO dbadmin;"`);
  } catch (error) {
    console.log(`ℹ️  Permissions might already be set for ${dbName}`);
  }
  
  // Connect to the new database and create tables with data
  const dbPool = new Pool({
    connectionString: `postgresql://dbadmin:dbadmin123@localhost:5432/${dbName}`
  });
  
  try {
    // Create tables and insert sample data
    for (const { sql, description } of sampleData) {
      console.log(`   - ${description}`);
      await dbPool.query(sql);
    }
    console.log(`✅ Sample data inserted into ${dbName}`);
  } finally {
    await dbPool.end();
  }
}

async function registerDatabaseInDashboard(dbConfig) {
  const dashboardPool = new Pool({
    connectionString: 'postgresql://dbadmin:dbadmin123@localhost:5432/db_dashboard'
  });
  
  try {
    const encryptedPassword = encrypt(dbConfig.password);
    
    // Check if database already exists
    const existing = await dashboardPool.query(
      'SELECT id FROM databases WHERE name = $1',
      [dbConfig.name]
    );
    
    if (existing.rows.length > 0) {
      console.log(`ℹ️  Database ${dbConfig.name} already registered`);
      return;
    }
    
    await dashboardPool.query(
      `INSERT INTO databases 
       (name, host, port, database_name, username, password_encrypted, environment, read_only, edit_enabled, extra_confirmation_required)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        dbConfig.name,
        dbConfig.host,
        dbConfig.port,
        dbConfig.database_name,
        dbConfig.username,
        encryptedPassword,
        dbConfig.environment,
        dbConfig.environment === 'prod', // prod is read-only by default
        dbConfig.environment !== 'prod', // non-prod allows editing
        dbConfig.environment === 'prod'  // prod requires extra confirmation
      ]
    );
    
    console.log(`✅ Registered ${dbConfig.name} in dashboard`);
  } finally {
    await dashboardPool.end();
  }
}

async function setupSampleData() {
  console.log('🚀 Setting up sample databases and data...\n');
  
  // E-Commerce Database
  await createSampleDatabase('ecommerce_db', [
    {
      description: 'Creating users table',
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT true
        );
        
        INSERT INTO users (email, first_name, last_name) VALUES
        ('john.doe@example.com', 'John', 'Doe'),
        ('jane.smith@example.com', 'Jane', 'Smith'),
        ('mike.johnson@example.com', 'Mike', 'Johnson'),
        ('sarah.wilson@example.com', 'Sarah', 'Wilson'),
        ('david.brown@example.com', 'David', 'Brown')
        ON CONFLICT (email) DO NOTHING;
      `
    },
    {
      description: 'Creating products table',
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          stock_quantity INTEGER DEFAULT 0,
          category VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        INSERT INTO products (name, description, price, stock_quantity, category) VALUES
        ('MacBook Pro 16"', 'High-performance laptop for professionals', 2499.99, 15, 'Electronics'),
        ('iPhone 15 Pro', 'Latest smartphone with advanced features', 999.99, 50, 'Electronics'),
        ('Nike Air Max 270', 'Comfortable running shoes', 129.99, 100, 'Footwear'),
        ('Levi''s 501 Jeans', 'Classic straight-fit jeans', 79.99, 75, 'Clothing'),
        ('Sony WH-1000XM5', 'Noise-canceling wireless headphones', 399.99, 25, 'Electronics');
      `
    },
    {
      description: 'Creating orders table',
      sql: `
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          total_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        INSERT INTO orders (user_id, total_amount, status) VALUES
        (1, 2499.99, 'completed'),
        (2, 129.99, 'shipped'),
        (3, 999.99, 'processing'),
        (4, 79.99, 'completed'),
        (5, 399.99, 'pending');
      `
    }
  ]);
  
  // Blog Database
  await createSampleDatabase('blog_db', [
    {
      description: 'Creating authors table',
      sql: `
        CREATE TABLE IF NOT EXISTS authors (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          bio TEXT,
          avatar_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        INSERT INTO authors (name, email, bio) VALUES
        ('Alex Thompson', 'alex@blog.com', 'Tech writer and software engineer'),
        ('Maria Garcia', 'maria@blog.com', 'UX designer and product strategist'),
        ('James Wilson', 'james@blog.com', 'DevOps engineer and cloud architect')
        ON CONFLICT (email) DO NOTHING;
      `
    },
    {
      description: 'Creating posts table',
      sql: `
        CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT NOT NULL,
          author_id INTEGER REFERENCES authors(id),
          published BOOLEAN DEFAULT false,
          published_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        INSERT INTO posts (title, slug, content, author_id, published, published_at) VALUES
        ('Getting Started with Next.js 14', 'getting-started-nextjs-14', 'Learn how to build modern web applications with Next.js 14...', 1, true, NOW() - INTERVAL '2 days'),
        ('Modern CSS Techniques', 'modern-css-techniques', 'Explore the latest CSS features and best practices...', 2, true, NOW() - INTERVAL '1 week'),
        ('Docker for Developers', 'docker-for-developers', 'A comprehensive guide to containerization...', 3, true, NOW() - INTERVAL '3 days'),
        ('React Server Components', 'react-server-components', 'Understanding the new paradigm in React...', 1, false, NULL),
        ('Database Design Patterns', 'database-design-patterns', 'Best practices for designing scalable databases...', 3, true, NOW() - INTERVAL '5 days');
      `
    },
    {
      description: 'Creating comments table',
      sql: `
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          post_id INTEGER REFERENCES posts(id),
          author_name VARCHAR(255) NOT NULL,
          author_email VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          approved BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        INSERT INTO comments (post_id, author_name, author_email, content, approved) VALUES
        (1, 'John Reader', 'john@reader.com', 'Great article! Very helpful for beginners.', true),
        (1, 'Sarah Dev', 'sarah@dev.com', 'Thanks for the detailed explanation.', true),
        (2, 'Mike Designer', 'mike@design.com', 'Love these CSS tips!', true),
        (3, 'Lisa Ops', 'lisa@ops.com', 'Docker has been a game-changer for our team.', true);
      `
    }
  ]);
  
  // Analytics Database
  await createSampleDatabase('analytics_db', [
    {
      description: 'Creating page_views table',
      sql: `
        CREATE TABLE IF NOT EXISTS page_views (
          id SERIAL PRIMARY KEY,
          page_url VARCHAR(500) NOT NULL,
          user_agent TEXT,
          ip_address VARCHAR(45),
          referrer VARCHAR(500),
          session_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        INSERT INTO page_views (page_url, user_agent, ip_address, referrer, session_id) VALUES
        ('/home', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '192.168.1.100', 'https://google.com', 'sess_001'),
        ('/products', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '192.168.1.101', 'https://facebook.com', 'sess_002'),
        ('/blog/nextjs-guide', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)', '192.168.1.102', 'https://twitter.com', 'sess_003'),
        ('/contact', 'Mozilla/5.0 (Android 13; Mobile)', '192.168.1.103', 'direct', 'sess_004'),
        ('/about', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '192.168.1.104', 'https://linkedin.com', 'sess_005');
      `
    },
    {
      description: 'Creating user_events table',
      sql: `
        CREATE TABLE IF NOT EXISTS user_events (
          id SERIAL PRIMARY KEY,
          event_name VARCHAR(100) NOT NULL,
          user_id VARCHAR(255),
          properties JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        INSERT INTO user_events (event_name, user_id, properties) VALUES
        ('page_view', 'user_123', '{"page": "/home", "duration": 45}'),
        ('button_click', 'user_456', '{"button": "signup", "location": "header"}'),
        ('form_submit', 'user_789', '{"form": "contact", "success": true}'),
        ('purchase', 'user_123', '{"product_id": "prod_001", "amount": 99.99}'),
        ('search', 'user_456', '{"query": "nextjs tutorial", "results": 15}');
      `
    },
    {
      description: 'Creating daily_stats table',
      sql: `
        CREATE TABLE IF NOT EXISTS daily_stats (
          id SERIAL PRIMARY KEY,
          date DATE NOT NULL UNIQUE,
          total_visitors INTEGER DEFAULT 0,
          page_views INTEGER DEFAULT 0,
          bounce_rate DECIMAL(5,2) DEFAULT 0,
          avg_session_duration INTEGER DEFAULT 0
        );
        
        INSERT INTO daily_stats (date, total_visitors, page_views, bounce_rate, avg_session_duration) VALUES
        (CURRENT_DATE - INTERVAL '7 days', 1250, 3200, 35.5, 180),
        (CURRENT_DATE - INTERVAL '6 days', 1180, 2950, 38.2, 165),
        (CURRENT_DATE - INTERVAL '5 days', 1320, 3450, 32.1, 195),
        (CURRENT_DATE - INTERVAL '4 days', 1450, 3800, 29.8, 210),
        (CURRENT_DATE - INTERVAL '3 days', 1380, 3600, 31.5, 185),
        (CURRENT_DATE - INTERVAL '2 days', 1520, 4100, 28.3, 220),
        (CURRENT_DATE - INTERVAL '1 day', 1680, 4500, 25.9, 240);
      `
    }
  ]);
  
  // Register databases in dashboard
  console.log('\n📝 Registering databases in dashboard...');
  for (const dbConfig of sampleDatabases) {
    await registerDatabaseInDashboard(dbConfig);
  }
  
  console.log('\n🎉 Sample data setup complete!');
  console.log('\nYou now have 3 sample databases:');
  console.log('1. 🛒 E-Commerce Store (Production) - Users, Products, Orders');
  console.log('2. 📝 Blog Platform (Staging) - Authors, Posts, Comments');
  console.log('3. 📊 Analytics Dashboard (Development) - Page Views, Events, Stats');
  console.log('\nLogin to your dashboard to explore the data!');
}

setupSampleData().catch(console.error);