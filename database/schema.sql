-- Internal Dashboard Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'VIEWER' CHECK (role IN ('ADMIN', 'VIEWER')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects (websites) table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Databases registry table
CREATE TABLE IF NOT EXISTS databases (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500), -- Website URL this database serves
  description TEXT, -- Description of what this database is for
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL DEFAULT 5432,
  database_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password_encrypted TEXT NOT NULL, -- Encrypted password
  environment VARCHAR(20) NOT NULL CHECK (environment IN ('prod', 'staging', 'dev')),
  read_only BOOLEAN DEFAULT true,
  edit_enabled BOOLEAN DEFAULT false,
  extra_confirmation_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table (immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL,
  database_id INTEGER REFERENCES databases(id) ON DELETE SET NULL,
  database_name VARCHAR(255) NOT NULL,
  table_name VARCHAR(255) NOT NULL,
  row_id VARCHAR(255),
  action VARCHAR(50) NOT NULL, -- 'UPDATE', 'INSERT', 'DELETE', 'VIEW'
  before_data JSONB,
  after_data JSONB,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_database_id ON audit_logs(database_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_databases_project_id ON databases(project_id);

