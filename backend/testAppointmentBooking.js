const mongoose = require('mongoose');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Appointment = require('./src/models/Appointment');

// Test appointment booking
async function testAppointmentBooking() {
  try {
    await mongoose.connect('mongodb://localhost:27017/healconnect_db');
    console.log('Connected to MongoDB');

    // Get patient user
    const user = await User.findOne({ mobile: '8849404609' });
    console.log('Found user:', user.name, 'Role:', user.role);

    // Get patient record
    const patient = await Patient.findOne({ userId: user._id });
    console.log('Found patient:', patient.name, 'Patient ID:', patient._id);

    // Get a doctor
    const doctor = await User.findOne({ role: 'doctor' });
    console.log('Found doctor:', doctor.name, 'Doctor ID:', doctor._id);

    // Test appointment data (matching frontend format)
    const appointmentData = {
      patientId: patient._id,
      patientName: patient.name,
      doctorId: doctor._id,
      date: new Date('2025-10-13'), // October 13, 2025 (from screenshot)
      time: '10:30 AM',
      timeSlot: '10:30 AM',
      type: 'checkup', // Health Checkup from screenshot
      reason: 'Health-checkup',
      status: 'pending'
    };

    console.log('Creating appointment with data:', JSON.stringify(appointmentData, null, 2));

    // Try to create appointment
    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();
    
    console.log('✅ Appointment created successfully!');
    console.log('Appointment ID:', savedAppointment._id);
    console.log('Status:', savedAppointment.status);

    // Clean up test appointment
    await Appointment.findByIdAndDelete(savedAppointment._id);
    console.log('🧹 Test appointment cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    process.exit(0);
  }
}

testAppointmentBooking();