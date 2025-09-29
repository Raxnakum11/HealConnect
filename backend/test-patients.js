// Test script to verify patient functionality
const mongoose = require('mongoose');

// Connect to database
mongoose.connect('mongodb://localhost:27017/healconnect_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Patient = require('./src/models/Patient');

async function testPatientIdGeneration() {
  try {
    console.log('🔍 Testing Patient ID generation...');
    
    // Find the highest existing patient ID
    const lastPatient = await Patient.findOne({}, { patientId: 1 }).sort({ patientId: -1 });
    console.log('📊 Last patient ID found:', lastPatient?.patientId || 'None');
    
    // Test our new ID generation logic
    let counter = 1;
    if (lastPatient && lastPatient.patientId) {
      const lastNumber = parseInt(lastPatient.patientId.replace('PAT', ''));
      counter = lastNumber + 1;
      console.log('➡️ Next ID should be:', `PAT${String(counter).padStart(4, '0')}`);
    }
    
    // Check for unassigned patients
    const unassignedPatients = await Patient.find({
      $or: [
        { doctorId: { $exists: false } },
        { doctorId: null }
      ],
      isActive: true
    }).select('patientId name email mobile');
    
    console.log('👥 Unassigned patients:', unassignedPatients.length);
    unassignedPatients.forEach(patient => {
      console.log(`  - ${patient.patientId}: ${patient.name} (${patient.email || 'No email'})`);
    });
    
    // Check patients with and without email
    const allPatients = await Patient.find({ isActive: true }).select('patientId name email mobile');
    const patientsWithEmail = allPatients.filter(p => p.email);
    const patientsWithoutEmail = allPatients.filter(p => !p.email);
    
    console.log(`📧 Patients with email: ${patientsWithEmail.length}/${allPatients.length}`);
    console.log(`❌ Patients without email: ${patientsWithoutEmail.length}/${allPatients.length}`);
    
    if (patientsWithoutEmail.length > 0) {
      console.log('📋 Patients needing email addresses:');
      patientsWithoutEmail.slice(0, 5).forEach(patient => {
        console.log(`  - ${patient.patientId}: ${patient.name} (${patient.mobile})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('✅ Test completed');
  }
}

testPatientIdGeneration();