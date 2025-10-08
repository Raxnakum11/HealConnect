// Test script to check what patients are in the database
const mongoose = require('mongoose');
const Patient = require('./src/models/Patient');

const MONGODB_URI = 'mongodb://localhost:27017/healconnect_db';

async function testPatients() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    console.log('\n=== Fetching all patients ===');
    const allPatients = await Patient.find({});
    console.log(`Total patients found: ${allPatients.length}`);
    
    allPatients.forEach((patient, index) => {
      console.log(`\nPatient ${index + 1}:`);
      console.log(`  ID: ${patient._id}`);
      console.log(`  Name: ${patient.name}`);
      console.log(`  Mobile: ${patient.mobile}`);
      console.log(`  Email: ${patient.email || 'N/A'}`);
      console.log(`  Address: ${patient.address || 'N/A'}`);
      console.log(`  Doctor ID: ${patient.doctorId || 'N/A'}`);
    });

    console.log('\n=== Test doctor query (real API query) ===');
    const doctorId = '68d58e0f8e2dcd2dad6bde9f';
    console.log(`Looking for patients for doctor: ${doctorId}`);
    
    const doctorPatients = await Patient.find({
      $or: [
        { doctorId: doctorId },
        { doctorId: { $exists: false } },
        { doctorId: null }
      ]
    });
    
    console.log(`Patients for doctor: ${doctorPatients.length}`);
    doctorPatients.forEach((patient, index) => {
      console.log(`  ${index + 1}. ${patient.name} (${patient._id})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testPatients();