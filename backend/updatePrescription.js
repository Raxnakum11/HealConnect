// Update prescription with correct instructions
const mongoose = require('mongoose');
const Prescription = require('./src/models/Prescription');
const Patient = require('./src/models/Patient');
const User = require('./src/models/User');

const MONGODB_URI = 'mongodb://localhost:27017/healconnect_db';

async function updatePrescription() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Update the prescription with ID 68e628b71f0a152f119e884d
    const prescriptionId = '68e628b71f0a152f119e884d';
    const detailedInstructions = 'Take Paracetamol 500mg twice daily after meals for fever and headache. Monitor temperature daily. Stay hydrated and get adequate rest. Return if fever persists beyond 3 days or if temperature exceeds 102°F.';

    console.log(`\n=== Updating prescription ${prescriptionId} ===`);
    
    const result = await Prescription.findByIdAndUpdate(
      prescriptionId,
      { 
        additionalNotes: detailedInstructions 
      },
      { new: true }
    );

    if (result) {
      console.log('✅ Prescription updated successfully!');
      console.log('Old instructions: "Take all medcine everyday!!!"');
      console.log('New instructions:', result.additionalNotes);
    } else {
      console.log('❌ Prescription not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

updatePrescription();