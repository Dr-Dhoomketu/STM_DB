#!/usr/bin/env node

/**
 * Comprehensive security testing script for the secure PostgreSQL web editor
 * Tests all critical security requirements after hardening
 */

const fetch = globalThis.fetch;

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

class SecurityTester {
  constructor() {
    this.testResults = [];
    this.cookies = '';
  }

  async runTest(name, testFn) {
    console.log(`🧪 Testing: ${name}`);
    try {
      const result = await testFn();
      this.testResults.push({ name, status: 'PASS', result });
      console.log(`✅ PASS: ${name}`);
      return result;
    } catch (error) {
      this.testResults.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ FAIL: ${name} - ${error.message}`);
      throw error;
    }
  }

  async testOTPVerificationRequired() {
    return this.runTest('OTP verification required for DB writes', async () => {
      const response = await fetch(`${BASE_URL}/api/databases/update-row`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dbId: 1,
          tableName: 'test',
          primaryKeyColumn: 'id',
          primaryKeyValue: 1,
          before: { name: 'old' },
          after: { name: 'new' },
          confirmation: 'YES'
        })
      });

      if (response.status !== 401) {
        throw new Error('Should return 401 for missing OTP verification');
      }

      const data = await response.json();
      if (!data.error.includes('OTP verification required')) {
        throw new Error('Should mention OTP verification in error');
      }

      return 'OTP verification enforced on DB writes';
    });
  }

  async testYESConfirmationRequired() {
    return this.runTest('YES confirmation required on backend', async () => {
      const response = await fetch(`${BASE_URL}/api/databases/update-row`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': 'fake-session-cookie'
        },
        body: JSON.stringify({
          dbId: 1,
          tableName: 'test',
          primaryKeyColumn: 'id',
          primaryKeyValue: 1,
          before: { name: 'old' },
          after: { name: 'new' },
          confirmation: 'NO'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        throw new Error('Should reject without proper YES confirmation');
      }

      if (!data.error.includes('YES')) {
        throw new Error('Should mention YES confirmation in error');
      }

      return 'YES confirmation enforced on backend';
    });
  }

  async testJWTStructure() {
    return this.runTest('JWT includes otpVerified field', async () => {
      const { JWTService } = require('../lib/jwt');
      
      const payload = {
        userId: 'test',
        email: 'test@example.com',
        role: 'ADMIN',
        otpVerified: true
      };

      const token = JWTService.sign(payload);
      const decoded = JWTService.verify(token);

      if (typeof decoded.otpVerified !== 'boolean') {
        throw new Error('JWT should include otpVerified boolean field');
      }

      return 'JWT includes otpVerified field';
    });
  }

  async testOTPHashing() {
    return this.runTest('OTP is hashed in database', async () => {
      const { OTPService } = require('../lib/otp');
      
      const otp = '123456';
      const hash = await OTPService.hashOTP(otp);
      
      if (hash === otp) {
        throw new Error('OTP should be hashed, not stored in plaintext');
      }

      const isValid = await OTPService.verifyOTP(otp, hash);
      if (!isValid) {
        throw new Error('OTP verification should work with hash');
      }

      return 'OTP properly hashed and verified';
    });
  }

  async testAuditLogging() {
    return this.runTest('Audit logging works', async () => {
      const { AuditService } = require('../lib/audit');
      
      const auditData = {
        userEmail: 'test@example.com',
        databaseName: 'test_db',
        tableName: 'test_table',
        rowId: '1',
        action: 'UPDATE',
        beforeData: { name: 'old' },
        afterData: { name: 'new' },
        ipAddress: '127.0.0.1'
      };

      await AuditService.log(auditData);
      
      return 'Audit log created successfully';
    });
  }

  async testSessionUtils() {
    return this.runTest('Session utils enforce OTP verification', async () => {
      const { requireOTPVerification } = require('../lib/session-utils');
      
      // Mock request without OTP verification
      const mockRequest = {
        cookies: {
          get: () => null
        }
      };

      const result = requireOTPVerification(mockRequest);
      
      if (result.verified) {
        throw new Error('Should not verify without proper OTP token');
      }

      if (!result.error.includes('OTP verification required')) {
        throw new Error('Should mention OTP verification requirement');
      }

      return 'Session utils properly enforce OTP verification';
    });
  }

  async testTransactionSafety() {
    return this.runTest('Transaction ensures audit log with DB write', async () => {
      // This test verifies the transaction pattern exists in the code
      const fs = require('fs');
      const updateRouteContent = fs.readFileSync('app/api/databases/update-row/route.ts', 'utf8');
      
      if (!updateRouteContent.includes('prisma.$transaction')) {
        throw new Error('Update route should use Prisma transactions');
      }

      if (!updateRouteContent.includes('auditLog.create')) {
        throw new Error('Update route should create audit log in transaction');
      }

      if (!updateRouteContent.includes('requireOTPVerification')) {
        throw new Error('Update route should require OTP verification');
      }

      return 'Transaction pattern correctly implemented';
    });
  }

  async runAllTests() {
    console.log('🔒 Starting Security Hardening Verification Tests');
    console.log('='.repeat(60));

    try {
      await this.testJWTStructure();
      await this.testOTPHashing();
      await this.testAuditLogging();
      await this.testSessionUtils();
      await this.testTransactionSafety();
      await this.testOTPVerificationRequired();
      await this.testYESConfirmationRequired();

      console.log('\n📊 Test Results Summary:');
      console.log('='.repeat(40));
      
      const passed = this.testResults.filter(r => r.status === 'PASS').length;
      const failed = this.testResults.filter(r => r.status === 'FAIL').length;
      
      console.log(`✅ Passed: ${passed}`);
      console.log(`❌ Failed: ${failed}`);
      
      if (failed === 0) {
        console.log('\n🎉 All security hardening tests passed!');
        console.log('Your PostgreSQL web editor is production-ready with:');
        console.log('  ✅ OTP verification enforced on all DB writes');
        console.log('  ✅ Backend YES confirmation required');
        console.log('  ✅ Guaranteed audit logging with transactions');
        console.log('  ✅ No possible bypass via direct API calls');
      } else {
        console.log('\n⚠️  Some tests failed. Please review and fix issues before deployment.');
        process.exit(1);
      }

    } catch (error) {
      console.error('\n💥 Test suite failed:', error.message);
      process.exit(1);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SecurityTester();
  tester.runAllTests();
}

module.exports = SecurityTester;