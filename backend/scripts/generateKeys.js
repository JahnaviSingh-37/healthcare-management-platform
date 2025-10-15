#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating encryption keys for Healthcare Platform...\n');

// Generate encryption key
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('✅ Encryption Key (32 bytes):');
console.log(`ENCRYPTION_KEY=${encryptionKey}\n`);

// Generate JWT secrets
const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
const sessionSecret = crypto.randomBytes(64).toString('hex');

console.log('✅ JWT Secret:');
console.log(`JWT_SECRET=${jwtSecret}\n`);

console.log('✅ JWT Refresh Secret:');
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}\n`);

console.log('✅ Session Secret:');
console.log(`SESSION_SECRET=${sessionSecret}\n`);

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  if (fs.existsSync(envExamplePath)) {
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // Replace placeholders with generated keys
    envContent = envContent.replace(
      'your-super-secret-jwt-key-change-this-in-production',
      jwtSecret
    );
    envContent = envContent.replace(
      'your-super-secret-refresh-token-key-change-this',
      jwtRefreshSecret
    );
    envContent = envContent.replace(
      'your-32-byte-hex-encryption-key-here',
      encryptionKey
    );
    envContent = envContent.replace(
      'your-session-secret-change-this',
      sessionSecret
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with generated keys\n');
  }
}

console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('1. Keep these keys secure and never commit them to version control');
console.log('2. Use different keys for development, staging, and production');
console.log('3. Rotate keys periodically');
console.log('4. Store production keys in a secure key management system\n');

console.log('✨ Key generation complete!');

