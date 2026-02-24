// Check database for users and patients with emails
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');

// Use the same connection string as the server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healconnect_db';

async function checkDatabaseData() {
  try {
    console.log('🔍 Checking Database Data for Email Integration');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check Users with emails
    console.log('\n👤 USERS WITH EMAILS:');
    console.log('-'.repeat(40));
    const users = await User.find({ email: { $exists: true, $ne: null } });
    
    if (users.length === 0) {
      console.log('❌ No users found with email addresses');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. User: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Mobile: ${user.mobile}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   ID: ${user._id}`);
        console.log('');
      });
    }

    // Check Patients with emails
    console.log('\n🏥 PATIENTS WITH EMAILS:');
    console.log('-'.repeat(40));
    const patients = await Patient.find({ email: { $exists: true, $ne: null } });
    
    if (patients.length === 0) {
      console.log('❌ No patients found with email addresses');
    } else {
      patients.forEach((patient, index) => {
        console.log(`${index + 1}. Patient: ${patient.name || patient.firstName + ' ' + patient.lastName}`);
        console.log(`   Email: ${patient.email}`);
        console.log(`   Mobile: ${patient.mobileNumber || patient.mobile}`);
        console.log(`   ID: ${patient._id}`);
        console.log('');
      });
    }

    // Check specific email
    console.log('\n🎯 CHECKING SPECIFIC EMAIL: patelaryan2106@gmail.com');
    console.log('-'.repeat(50));
    
    const userWithEmail = await User.findOne({ email: 'patelaryan2106@gmail.com' });
    if (userWithEmail) {
      console.log('✅ User found:');
      console.log(`   Name: ${userWithEmail.name}`);
      console.log(`   Email: ${userWithEmail.email}`);
      console.log(`   Role: ${userWithEmail.role}`);
      console.log(`   Created: ${userWithEmail.createdAt || 'Not available'}`);
    } else {
      console.log('❌ No user found with email patelaryan2106@gmail.com');
    }

    const patientWithEmail = await Patient.findOne({ email: 'patelaryan2106@gmail.com' });
    if (patientWithEmail) {
      console.log('✅ Patient found:');
      console.log(`   Name: ${patientWithEmail.name || patientWithEmail.firstName + ' ' + patientWithEmail.lastName}`);
      console.log(`   Email: ${patientWithEmail.email}`);
    } else {
      console.log('❌ No patient found with email patelaryan2106@gmail.com');
      console.log('💡 ISSUE IDENTIFIED: User exists but no corresponding Patient record with email');
    }

    // Check Patient schema to understand the structure
    console.log('\n📋 PATIENT SCHEMA ANALYSIS:');
    console.log('-'.repeat(40));
    const samplePatient = await Patient.findOne();
    if (samplePatient) {
      console.log('Sample patient structure:');
      console.log(JSON.stringify(samplePatient.toObject(), null, 2));
    } else {
      console.log('No patients found in database');
    }

  } catch (error) {
    console.error('❌ Database check error:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkDatabaseData();