const mongoose = require('mongoose');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const jwt = require('jsonwebtoken');

// Test the API endpoint directly
async function testAppointmentAPI() {
  try {
    await mongoose.connect('mongodb://localhost:27017/healconnect_db');
    console.log('Connected to MongoDB');

    // Get patient user and generate token
    const user = await User.findOne({ mobile: '8849404609' });
    console.log('Found user:', user.name, 'Role:', user.role);

    // Generate JWT token for authentication
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'healconnect_super_secret_jwt_key_2025',
      { expiresIn: '7d' }
    );

    console.log('Generated token for user');

    // Test appointment data (matching what frontend sends)
    const appointmentData = {
      date: '2025-10-13', // Format from frontend
      timeSlot: '10:30 AM',
      type: 'checkup',
      reason: 'Health-checkup'
      // Note: doctorId is optional - backend will assign first available doctor
    };

    console.log('Making API request with data:', JSON.stringify(appointmentData, null, 2));

    // Make actual HTTP request to the API
    const response = await fetch('http://localhost:5000/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('✅ API call successful!');
      console.log('Created appointment:', result);
    } else {
      console.log('❌ API call failed');
      try {
        const error = JSON.parse(responseText);
        console.log('Error details:', error);
      } catch (e) {
        console.log('Raw error response:', responseText);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    process.exit(0);
  }
}

testAppointmentAPI();