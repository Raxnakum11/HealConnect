const mongoose = require('mongoose');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient'); 

mongoose.connect('mongodb://localhost:27017/healthcare', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const users = await User.find();
    console.log('Users found:', users.length);
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile
      });
    });
    
    // Check if any users have role 'patient'
    const patientUsers = users.filter(user => user.role === 'patient');
    console.log('\nPatient users found:', patientUsers.length);
    
    // For each patient user, check if they have a Patient profile
    for (let user of patientUsers) {
      const patientProfile = await Patient.findOne({ userId: user._id });
      console.log(`Patient profile for ${user.name}:`, patientProfile ? 'EXISTS' : 'MISSING');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });