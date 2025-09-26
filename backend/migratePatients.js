// Migration to create Patient records for existing patient users
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healconnect_db';

async function migratePatientUsers() {
  try {
    console.log('🚀 Starting Patient User Migration');
    console.log('=' .repeat(50));
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with role 'patient' who don't have patient records
    const patientUsers = await User.find({ role: 'patient' });
    console.log(`📋 Found ${patientUsers.length} patient users`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of patientUsers) {
      try {
        // Check if patient record already exists
        const existingPatient = await Patient.findOne({ 
          $or: [
            { email: user.email },
            { userId: user._id },
            { mobile: user.mobile }
          ]
        });

        console.log(`🔍 Checking user: ${user.email}`);
        console.log(`   Mobile: ${user.mobile}`);
        console.log(`   User ID: ${user._id}`);
        console.log(`   Existing patient found: ${!!existingPatient}`);
        if (existingPatient) {
          console.log(`   Existing patient details: ID=${existingPatient.patientId}, Email=${existingPatient.email}, Mobile=${existingPatient.mobile}`);
        }

        if (existingPatient) {
          console.log(`⏭️  Skipping ${user.email} - Patient record exists`);
          skipped++;
          continue;
        }

        // Generate unique patient ID
        const patientCount = await Patient.countDocuments();
        const patientId = `PAT${String(patientCount + 1).padStart(4, '0')}`;

        // Create patient record
        const patientData = {
          patientId,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          age: 25, // Default age
          gender: 'Other', // Default gender
          address: 'Not provided', // Default address
          medicalHistory: '',
          type: 'clinic', // Self-registered patients are clinic type
          userId: user._id
          // No doctorId for self-registered patients
        };

        await Patient.create(patientData);
        console.log(`✅ Created patient record for: ${user.email}`);
        created++;

      } catch (error) {
        console.error(`❌ Error creating patient for ${user.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Created: ${created} patient records`);
    console.log(`⏭️  Skipped: ${skipped} (already exist)`);
    console.log(`❌ Errors: ${errors}`);

    // Verify the specific user's migration
    console.log('\n🎯 Checking patelaryan2106@gmail.com:');
    const specificUser = await User.findOne({ email: 'patelaryan2106@gmail.com' });
    if (specificUser) {
      const specificPatient = await Patient.findOne({ email: 'patelaryan2106@gmail.com' });
      if (specificPatient) {
        console.log('✅ Patient record now exists for patelaryan2106@gmail.com');
        console.log(`   Patient ID: ${specificPatient.patientId}`);
        console.log(`   Name: ${specificPatient.name}`);
      } else {
        console.log('❌ Still no patient record for patelaryan2106@gmail.com');
      }
    }

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

migratePatientUsers();