const mongoose = require('mongoose');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Appointment = require('./src/models/Appointment');
const jwt = require('jsonwebtoken');

// Test the complete appointment status update workflow with email notifications
async function testAppointmentStatusWorkflow() {
  try {
    await mongoose.connect('mongodb://localhost:27017/healconnect_db');
    console.log('Connected to MongoDB');

    // Get patient and doctor data
    const user = await User.findOne({ mobile: '8849404609' });
    const patient = await Patient.findOne({ mobile: '8849404609' });
    const doctor = await User.findOne({ role: 'doctor' });

    console.log('Found patient:', patient.name, 'Email:', patient.email);
    console.log('Found doctor:', doctor.name);

    // Create a test appointment
    const testAppointment = await Appointment.create({
      patientId: patient._id,
      patientName: patient.name,
      doctorId: doctor._id,
      date: new Date('2025-10-15'),
      time: '10:30 AM',
      timeSlot: '10:30 AM',
      type: 'checkup',
      reason: 'Health checkup for email notification test',
      status: 'pending'
    });

    console.log('Created test appointment:', testAppointment._id);

    // Generate JWT token for doctor
    const doctorToken = jwt.sign(
      { id: doctor._id, email: doctor.email, role: doctor.role },
      process.env.JWT_SECRET || 'healconnect_super_secret_jwt_key_2025',
      { expiresIn: '7d' }
    );

    console.log('Generated doctor token');

    // Test 1: Approve appointment via API
    console.log('\n=== Testing Appointment Approval via API ===');
    const approvalResponse = await fetch(`http://localhost:5000/api/appointments/${testAppointment._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doctorToken}`
      },
      body: JSON.stringify({
        status: 'approved',
        notes: 'Appointment confirmed. Please arrive 15 minutes early and bring your ID.'
      })
    });

    const approvalResult = await approvalResponse.text();
    console.log('Approval API Response Status:', approvalResponse.status);
    console.log('Approval API Response:', approvalResult);

    if (approvalResponse.ok) {
      console.log('✅ Appointment approved successfully!');
      console.log('📧 Email notification should be sent to:', patient.email);
    }

    // Wait 5 seconds
    console.log('\n⏳ Waiting 5 seconds before testing rejection...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Create another test appointment for rejection
    const testAppointment2 = await Appointment.create({
      patientId: patient._id,
      patientName: patient.name,
      doctorId: doctor._id,
      date: new Date('2025-10-16'),
      time: '2:00 PM',
      timeSlot: '2:00 PM',
      type: 'consultation',
      reason: 'Follow-up consultation for email test',
      status: 'pending'
    });

    console.log('Created second test appointment:', testAppointment2._id);

    // Test 2: Reject appointment via API
    console.log('\n=== Testing Appointment Rejection via API ===');
    const rejectionResponse = await fetch(`http://localhost:5000/api/appointments/${testAppointment2._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doctorToken}`
      },
      body: JSON.stringify({
        status: 'rejected',
        notes: 'Sorry, this time slot is no longer available. Please book another appointment.'
      })
    });

    const rejectionResult = await rejectionResponse.text();
    console.log('Rejection API Response Status:', rejectionResponse.status);
    console.log('Rejection API Response:', rejectionResult);

    if (rejectionResponse.ok) {
      console.log('✅ Appointment rejected successfully!');
      console.log('📧 Email notification should be sent to:', patient.email);
    }

    // Clean up test appointments
    await Appointment.findByIdAndDelete(testAppointment._id);
    await Appointment.findByIdAndDelete(testAppointment2._id);
    console.log('\n🧹 Test appointments cleaned up');

    console.log('\n🎉 Complete appointment status workflow test completed!');
    console.log('📬 Check your email inbox for both approval and rejection notifications.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testAppointmentStatusWorkflow();