// Update existing patient records with email addresses from user accounts
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healconnect_db';

async function updatePatientEmails() {
  try {
    console.log('📧 Updating Patient Records with Email Addresses');
    console.log('=' .repeat(55));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all patient users
    const patientUsers = await User.find({ role: 'patient' });
    console.log(`👥 Found ${patientUsers.length} patient users`);

    let updated = 0;
    let notFound = 0;
    let alreadyHasEmail = 0;

    for (const user of patientUsers) {
      try {
        console.log(`\n🔍 Processing: ${user.email} (${user.mobile})`);
        
        // Find patient record by mobile number
        const patient = await Patient.findOne({ mobile: user.mobile });
        
        if (!patient) {
          console.log(`   ❌ No patient record found for mobile: ${user.mobile}`);
          notFound++;
          continue;
        }

        // Check if patient already has email
        if (patient.email) {
          console.log(`   ✅ Patient already has email: ${patient.email}`);
          alreadyHasEmail++;
          continue;
        }

        // Update patient with email and userId
        await Patient.updateOne(
          { _id: patient._id },
          { 
            email: user.email,
            userId: user._id
          }
        );

        console.log(`   ✅ Updated patient ${patient.patientId} with email: ${user.email}`);
        updated++;

      } catch (error) {
        console.error(`   ❌ Error updating patient for ${user.email}:`, error.message);
      }
    }

    console.log('\n📊 Update Summary:');
    console.log(`✅ Updated: ${updated} patient records`);
    console.log(`📧 Already had email: ${alreadyHasEmail}`);
    console.log(`❌ Not found: ${notFound}`);

    // Verify the specific patient
    console.log('\n🎯 Verification - patelaryan2106@gmail.com:');
    const specificPatient = await Patient.findOne({ email: 'patelaryan2106@gmail.com' });
    
    if (specificPatient) {
      console.log('✅ SUCCESS! Patient record now has email:');
      console.log(`   Patient ID: ${specificPatient.patientId}`);
      console.log(`   Name: ${specificPatient.name}`);
      console.log(`   Email: ${specificPatient.email}`);
      console.log(`   Mobile: ${specificPatient.mobile}`);
    } else {
      console.log('❌ Still no patient record with email patelaryan2106@gmail.com');
    }

    // Count total patients with emails now
    const emailPatientCount = await Patient.countDocuments({ 
      email: { $exists: true, $ne: null, $ne: '' }
    });
    console.log(`\n📊 Total patients with email addresses: ${emailPatientCount}`);

  } catch (error) {
    console.error('❌ Update error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

updatePatientEmails();