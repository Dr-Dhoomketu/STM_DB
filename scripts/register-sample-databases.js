#!/usr/bin/env node

/**
 * Script to register sample databases for testing
 * This shows how to connect to your actual Coolify databases
 */

const { Pool } = require('pg');
const { encrypt } = require('../lib/encryption');

async function registerSampleDatabases() {
  console.log('🗄️ Registering Sample Databases');
  console.log('================================');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dbadmin:dbadmin123@localhost:5432/db_dashboard'
  });

  try {
    // Sample databases - replace these with your actual Coolify service names
    const sampleDatabases = [
      {
        name: 'My Blog Database',
        website_url: 'https://myblog.com',
        description: 'WordPress blog database with posts, users, and comments',
        host: 'myblog-db', // Coolify service name
        port: 5432,
        database_name: 'wordpress',
        username: 'wordpress_user',
        password: 'your-db-password', // Replace with actual password
        environment: 'prod'
      },
      {
        name: 'E-commerce Store DB',
        website_url: 'https://mystore.com',
        description: 'Online store database with products, orders, and customers',
        host: 'store-db', // Coolify service name
        port: 5432,
        database_name: 'ecommerce',
        username: 'store_user',
        password: 'your-db-password', // Replace with actual password
        environment: 'prod'
      },
      {
        name: 'API Backend Database',
        website_url: 'https://api.myapp.com',
        description: 'REST API backend database with user data and application state',
        host: 'api-db', // Coolify service name
        port: 5432,
        database_name: 'api_backend',
        username: 'api_user',
        password: 'your-db-password', // Replace with actual password
        environment: 'prod'
      },
      {
        name: 'Staging Environment',
        website_url: 'https://staging.myapp.com',
        description: 'Staging environment for testing new features',
        host: 'staging-db', // Coolify service name
        port: 5432,
        database_name: 'staging_app',
        username: 'staging_user',
        password: 'your-db-password', // Replace with actual password
        environment: 'staging'
      }
    ];

    for (const db of sampleDatabases) {
      console.log(`\n📝 Registering: ${db.name}`);
      
      // Encrypt password
      const encryptedPassword = encrypt(db.password);
      
      const result = await pool.query(
        `INSERT INTO databases 
         (name, website_url, description, host, port, database_name, username, password_encrypted, 
          environment, read_only, edit_enabled, extra_confirmation_required)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id, name`,
        [
          db.name,
          db.website_url,
          db.description,
          db.host,
          db.port,
          db.database_name,
          db.username,
          encryptedPassword,
          db.environment,
          true, // read_only
          false, // edit_enabled
          db.environment === 'prod' // extra_confirmation_required
        ]
      );
      
      console.log(`✅ Registered: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    }

    console.log('\n🎉 All sample databases registered successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update the host names with your actual Coolify service names');
    console.log('2. Update the passwords with your actual database passwords');
    console.log('3. Test connections from the dashboard');
    console.log('4. Enable edit mode for databases you want to modify');

  } catch (error) {
    console.error('❌ Error registering databases:', error.message);
  } finally {
    await pool.end();
  }
}

// Check if encryption key is set
if (!process.env.ENCRYPTION_KEY) {
  console.error('❌ ENCRYPTION_KEY environment variable is not set');
  console.log('Please set ENCRYPTION_KEY and try again.');
  process.exit(1);
}

registerSampleDatabases();