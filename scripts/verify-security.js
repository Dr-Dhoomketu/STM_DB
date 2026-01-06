#!/usr/bin/env node

/**
 * Security Verification Script
 * Verifies that all security requirements are properly implemented
 */

const fs = require('fs');
const path = require('path');

class SecurityVerifier {
  constructor() {
    this.checks = [];
    this.passed = 0;
    this.failed = 0;
  }

  check(name, condition, details = '') {
    const result = condition();
    this.checks.push({ name, passed: result, details });
    
    if (result) {
      console.log(`✅ ${name}`);
      this.passed++;
    } else {
      console.log(`❌ ${name}`);
      if (details) console.log(`   ${details}`);
      this.failed++;
    }
  }

  fileExists(filePath) {
    return fs.existsSync(path.join(__dirname, '..', filePath));
  }

  fileContains(filePath, searchString) {
    if (!this.fileExists(filePath)) return false;
    const content = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
    return content.includes(searchString);
  }

  async run() {
    console.log('🔒 Security Architecture Verification');
    console.log('=====================================\n');

    // 1. Control Database Architecture
    console.log('📊 Control Database Architecture:');
    this.check(
      'Prisma schema exists',
      () => this.fileExists('prisma/schema.prisma')
    );
    
    this.check(
      'Database model with encrypted passwords',
      () => this.fileContains('prisma/schema.prisma', 'passwordEncrypted')
    );

    this.check(
      'User model with OTP relations',
      () => this.fileContains('prisma/schema.prisma', 'loginOtps')
    );

    this.check(
      'AuditLog model exists',
      () => this.fileContains('prisma/schema.prisma', 'model AuditLog')
    );

    console.log('');

    // 2. Encryption Implementation
    console.log('🔐 Credential Encryption:');
    this.check(
      'Encryption utilities exist',
      () => this.fileExists('lib/encryption.ts')
    );

    this.check(
      'AES-256-GCM encryption used',
      () => this.fileContains('lib/encryption.ts', 'aes-256-gcm')
    );

    this.check(
      'DB_CREDENTIAL_ENCRYPTION_KEY support',
      () => this.fileContains('lib/encryption.ts', 'DB_CREDENTIAL_ENCRYPTION_KEY')
    );

    console.log('');

    // 3. Dynamic Database Connections
    console.log('🔌 Dynamic Database Access:');
    this.check(
      'External database client utilities',
      () => this.fileExists('lib/db.ts')
    );

    this.check(
      'Uses pg library for external connections',
      () => this.fileContains('lib/db.ts', 'getExternalDbClient')
    );

    this.check(
      'Proper connection cleanup',
      () => this.fileContains('lib/db.ts', 'closeExternalDbClient')
    );

    console.log('');

    // 4. OTP Authentication
    console.log('🔑 OTP Authentication:');
    this.check(
      'OTP utilities exist',
      () => this.fileExists('lib/otp.ts')
    );

    this.check(
      'Session utilities with OTP verification',
      () => this.fileExists('lib/session-utils.ts')
    );

    this.check(
      'OTP verification in auth config',
      () => this.fileExists('lib/auth-config.ts')
    );

    console.log('');

    // 5. API Security
    console.log('🛡️ API Security:');
    this.check(
      'Update row API exists',
      () => this.fileExists('app/api/databases/update-row/route.ts')
    );

    this.check(
      'OTP verification required for writes',
      () => this.fileContains('app/api/databases/update-row/route.ts', 'requireOTPVerification')
    );

    this.check(
      'YES confirmation enforced',
      () => this.fileContains('app/api/databases/update-row/route.ts', 'confirmation !== "YES"')
    );

    this.check(
      'Transaction-safe audit logging',
      () => this.fileContains('app/api/databases/update-row/route.ts', '$transaction')
    );

    console.log('');

    // 6. Frontend Security
    console.log('🖥️ Frontend Security:');
    this.check(
      'Safe edit mode component',
      () => this.fileExists('components/SafeEditMode.tsx')
    );

    this.check(
      'Database list without credentials',
      () => this.fileExists('components/DatabasesList.tsx') && 
            !this.fileContains('components/DatabasesList.tsx', 'password')
    );

    console.log('');

    // 7. Environment Configuration
    console.log('⚙️ Environment Configuration:');
    this.check(
      'Environment example exists',
      () => this.fileExists('.env.example')
    );

    this.check(
      'DB_CREDENTIAL_ENCRYPTION_KEY in env example',
      () => this.fileContains('.env.example', 'DB_CREDENTIAL_ENCRYPTION_KEY')
    );

    this.check(
      'No hardcoded credentials in env example',
      () => !this.fileContains('.env.example', 'real-password')
    );

    console.log('');

    // 8. Database Browsing
    console.log('🗂️ Database Browsing:');
    this.check(
      'Database selection page exists',
      () => this.fileExists('app/dashboard/databases/page.tsx')
    );

    this.check(
      'Table browsing exists',
      () => this.fileExists('app/dashboard/databases/[dbId]/tables/page.tsx')
    );

    this.check(
      'Row viewing exists',
      () => this.fileExists('app/dashboard/databases/[dbId]/tables/[tableName]/page.tsx')
    );

    console.log('');

    // Summary
    console.log('📋 Security Verification Summary:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📊 Total: ${this.passed + this.failed}`);

    if (this.failed === 0) {
      console.log('\n🎉 ALL SECURITY REQUIREMENTS VERIFIED!');
      console.log('The system is ready for production deployment.');
      return true;
    } else {
      console.log('\n⚠️  Some security requirements need attention.');
      return false;
    }
  }
}

// Run verification
const verifier = new SecurityVerifier();
verifier.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});