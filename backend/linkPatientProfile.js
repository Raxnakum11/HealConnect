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
    
    // Find the patient profile
    const patient = await Patient.findOne({ mobile: '8849404609' });
    if (!patient) {
      console.log('Patient profile not found');
      process.exit(1);
    }
    
    console.log('Found patient profile:', {
      _id: patient._id,
      patientId: patient.patientId,
      name: patient.name,
      mobile: patient.mobile,
      userId: patient.userId,
      isLinked: patient.userId ? 'YES' : 'NO'
    });
    
    // Check if they are properly linked
    if (!patient.userId || patient.userId.toString() !== user._id.toString()) {
      console.log('⚠️ Patient profile is not properly linked to user account!');
      console.log('Fixing the link...');
      
      patient.userId = user._id;
      await patient.save();
      
      console.log('✅ Patient profile linked successfully!');
    } else {
      console.log('✅ Patient profile is already properly linked!');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });