// Check prescriptions in database
const mongoose = require('mongoose');
const Prescription = require('./src/models/Prescription');
const Patient = require('./src/models/Patient');
const User = require('./src/models/User');

const MONGODB_URI = 'mongodb://localhost:27017/healconnect_db';

async function checkPrescriptions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    console.log('\n=== Fetching all prescriptions ===');
    const allPrescriptions = await Prescription.find({}).populate('patientId', 'name').populate('doctorId', 'name');
    console.log(`Total prescriptions found: ${allPrescriptions.length}`);
    
    allPrescriptions.forEach((prescription, index) => {
      console.log(`\nPrescription ${index + 1}:`);
      console.log(`  ID: ${prescription._id}`);
      console.log(`  Patient: ${prescription.patientId?.name || 'Unknown'}`);
      console.log(`  Doctor: ${prescription.doctorId?.name || 'Unknown'}`);
      console.log(`  Symptoms: ${prescription.symptoms}`);
      console.log(`  Diagnosis: ${prescription.diagnosis}`);
      console.log(`  Additional Notes: ${prescription.additionalNotes}`);
      console.log(`  Medicines: ${prescription.medicines?.length || 0} items`);
      prescription.medicines?.forEach((med, medIndex) => {
        console.log(`    Medicine ${medIndex + 1}: ${med.medicineName} - ${med.instructions}`);
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkPrescriptions();