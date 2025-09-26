// Detailed check of all patients and their email status
const mongoose = require('mongoose');
const Patient = require('./src/models/Patient');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healconnect_db';

async function detailedPatientCheck() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get ALL patients
    console.log('\n🔍 ALL PATIENTS IN DATABASE:');
    console.log('=' .repeat(60));
    
    const allPatients = await Patient.find({});
    console.log(`Total patients: ${allPatients.length}\n`);

    allPatients.forEach((patient, index) => {
      console.log(`${index + 1}. Patient ID: ${patient.patientId || 'N/A'}`);
      console.log(`   Name: ${patient.name || 'N/A'}`);
      console.log(`   Email: ${patient.email || 'NO EMAIL'}`);
      console.log(`   Mobile: ${patient.mobile || 'N/A'}`);
      console.log(`   Has Email: ${!!patient.email}`);
      console.log(`   MongoDB ID: ${patient._id}`);
      console.log('');
    });

    // Specifically search for patelaryan2106@gmail.com
    console.log('\n🎯 SPECIFIC SEARCH FOR patelaryan2106@gmail.com:');
    console.log('-' .repeat(50));
    
    const specificPatient = await Patient.findOne({ 
      email: { $regex: 'patelaryan2106@gmail.com', $options: 'i' }
    });
    
    if (specificPatient) {
      console.log('✅ FOUND Patient with email patelaryan2106@gmail.com:');
      console.log(JSON.stringify(specificPatient.toObject(), null, 2));
    } else {
      console.log('❌ NO patient found with email patelaryan2106@gmail.com');
    }

    // Count patients with emails
    const patientsWithEmail = await Patient.countDocuments({ 
      email: { $exists: true, $ne: null, $ne: '' }
    });
    console.log(`\n📊 Patients with email addresses: ${patientsWithEmail}`);

    // Search for any patient with similar email patterns
    const emailPatterns = await Patient.find({ 
      email: { $regex: 'patel.*gmail', $options: 'i' }
    });
    console.log(`\n🔍 Patients with 'patel' and 'gmail' in email: ${emailPatterns.length}`);
    emailPatterns.forEach(p => {
      console.log(`   - ${p.name}: ${p.email}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

detailedPatientCheck();