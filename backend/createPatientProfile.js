const mongoose = require('mongoose');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');

mongoose.connect('mongodb://localhost:27017/healconnect_db', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find the current patient user (Raxeet Nakum)
    const user = await User.findOne({ mobile: '8849404609' });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    console.log('Found user:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role
    });
    
    // Check if patient profile already exists
    const existingPatient = await Patient.findOne({ userId: user._id });
    if (existingPatient) {
      console.log('Patient profile already exists:', existingPatient._id);
      process.exit(0);
    }
    
    // Create patient profile
    const patient = new Patient({
      patientId: 'P002', // Unique patient ID
      name: user.name,
      mobile: user.mobile,
      email: user.email || '',
      userId: user._id,
      age: 25, // Default age
      gender: 'Male', // Default gender
      address: '123 Patient Address, City',
      medicalHistory: 'No known medical history.',
      type: 'clinic'
    });
    
    await patient.save();
    console.log('Patient profile created successfully:', patient._id);
    
    console.log('\n=== Patient Profile Details ===');
    console.log('Patient ID:', patient.patientId);
    console.log('User ID:', patient.userId);
    console.log('Name:', patient.name);
    console.log('Mobile:', patient.mobile);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });