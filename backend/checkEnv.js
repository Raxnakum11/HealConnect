// Test environment variable loading
console.log('🔍 Testing Environment Variable Loading');
console.log('======================================');

// Try different approaches to load .env
console.log('1. Current working directory:', process.cwd());
console.log('2. __dirname:', __dirname);

// Method 1: Basic dotenv
try {
  require('dotenv').config();
  console.log('✅ Basic dotenv.config() executed');
} catch (error) {
  console.log('❌ Basic dotenv failed:', error.message);
}

console.log('📋 Environment variables after basic config:');
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET' : 'NOT SET'}`);

// Method 2: Explicit path
try {
  const path = require('path');
  const envPath = path.join(__dirname, '.env');
  console.log('\n3. Trying explicit .env path:', envPath);
  require('dotenv').config({ path: envPath });
  console.log('✅ Explicit path dotenv.config() executed');
} catch (error) {
  console.log('❌ Explicit path dotenv failed:', error.message);
}

console.log('\n📋 Environment variables after explicit path:');
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET' : 'NOT SET'}`);

// Method 3: Check if .env file exists
const fs = require('fs');
const path = require('path');
const envFile = path.join(__dirname, '.env');

console.log('\n4. Checking .env file existence:');
console.log(`   Path: ${envFile}`);
console.log(`   Exists: ${fs.existsSync(envFile)}`);

if (fs.existsSync(envFile)) {
  try {
    const envContent = fs.readFileSync(envFile, 'utf8');
    console.log('✅ .env file content loaded');
    
    // Extract EMAIL lines
    const emailLines = envContent.split('\n').filter(line => 
      line.startsWith('EMAIL_') && !line.startsWith('#')
    );
    
    console.log('\n📋 EMAIL configuration lines found:');
    emailLines.forEach(line => {
      if (line.includes('EMAIL_PASS')) {
        console.log(`   ${line.split('=')[0]}=****`);
      } else {
        console.log(`   ${line}`);
      }
    });
    
  } catch (error) {
    console.log('❌ Failed to read .env file:', error.message);
  }
}

// Final check
console.log('\n🎯 FINAL STATUS:');
console.log('================');
console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET (length: ' + process.env.EMAIL_PASS.length + ')' : 'NOT SET'}`);

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log('✅ Email configuration loaded successfully');
} else {
  console.log('❌ Email configuration not loaded');
}