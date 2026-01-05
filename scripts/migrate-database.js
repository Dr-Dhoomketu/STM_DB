#!/usr/bin/env node

/**
 * Migration script to add new columns to existing database
 */

const { Pool } = require('pg');

async function migrateDatabase() {
  console.log('🔄 Database Migration - Adding New Columns');
  console.log('==========================================');

  const pool = new Pool({
    connectionString: 'postgresql://dbadmin:dbadmin123@localhost:5432/db_dashboard'
  });

  try {
    // Check if columns already exist
    const checkColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'databases' 
      AND column_name IN ('website_url', 'description')
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);
    
    if (existingColumns.includes('website_url') && existingColumns.includes('description')) {
      console.log('✅ Columns already exist, no migration needed');
      return;
    }

    console.log('📝 Adding missing columns...');

    // Add website_url column if it doesn't exist
    if (!existingColumns.includes('website_url')) {
      await pool.query(`
        ALTER TABLE databases 
        ADD COLUMN website_url VARCHAR(500)
      `);
      console.log('✅ Added website_url column');
    }

    // Add description column if it doesn't exist
    if (!existingColumns.includes('description')) {
      await pool.query(`
        ALTER TABLE databases 
        ADD COLUMN description TEXT
      `);
      console.log('✅ Added description column');
    }

    console.log('🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateDatabase();