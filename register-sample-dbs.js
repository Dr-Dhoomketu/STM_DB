const { Pool } = require('pg');
const crypto = require('crypto');

function encrypt(text) {
  const key = Buffer.from('29961123fb7ccb0db3e907dbfc8bce8dce14433fd8c7ecb65ee177ae523d6d80', 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

const sampleDatabases = [
  {
    name: 'E-Commerce Store',
    host: 'localhost',
    port: 5432,
    database_name: 'ecommerce_db',
    username: 'dbadmin',
    password: 'dbadmin123',
    environment: 'prod',
  },
  {
    name: 'Blog Platform',
    host: 'localhost',
    port: 5432,
    database_name: 'blog_db',
    username: 'dbadmin',
    password: 'dbadmin123',
    environment: 'staging',
  },
  {
    name: 'Analytics Dashboard',
    host: 'localhost',
    port: 5432,
    database_name: 'analytics_db',
    username: 'dbadmin',
    password: 'dbadmin123',
    environment: 'dev',
  }
];

async function registerDatabases() {
  const pool = new Pool({
    connectionString: 'postgresql://dbadmin:dbadmin123@localhost:5432/db_dashboard'
  });
  
  for (const dbConfig of sampleDatabases) {
    try {
      const existing = await pool.query('SELECT id FROM databases WHERE name = $1', [dbConfig.name]);
      
      if (existing.rows.length > 0) {
        console.log(`ℹ️  ${dbConfig.name} already registered`);
        continue;
      }
      
      const encryptedPassword = encrypt(dbConfig.password);
      
      await pool.query(
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
          dbConfig.environment === 'prod',
          dbConfig.environment !== 'prod',
          dbConfig.environment === 'prod'
        ]
      );
      
      console.log(`✅ Registered ${dbConfig.name}`);
    } catch (error) {
      console.error(`❌ Error registering ${dbConfig.name}:`, error.message);
    }
  }
  
  await pool.end();
  console.log('\n🎉 Database registration complete!');
}

registerDatabases();