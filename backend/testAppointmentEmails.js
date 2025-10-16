const mongoose = require('mongoose');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Appointment = require('./src/models/Appointment');
const EmailService = require('./src/services/emailService');
const jwt = require('jsonwebtoken');

// Test appointment status email notifications
async function testAppointmentStatusEmails() {
  try {
    await mongoose.connect('mongodb://localhost:27017/healconnect_db');
    console.log('Connected to MongoDB');

    // Get patient user
    const user = await User.findOne({ mobile: '8849404609' });
    const patient = await Patient.findOne({ mobile: '8849404609' });
    const doctor = await User.findOne({ role: 'doctor' });

    console.log('Found user:', user.name, 'Email:', user.email);
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
      reason: 'Health checkup',
      status: 'pending'
    });

    console.log('Created test appointment:', testAppointment._id);

    // Test email service
    const emailService = new EmailService();
    
    // Test 1: Appointment Approval Email
    console.log('\n=== Testing Appointment Approval Email ===');
    const appointmentData = {
      patientName: patient.name,
      doctorName: doctor.name,
      date: testAppointment.date,
      time: testAppointment.time,
      timeSlot: testAppointment.timeSlot,
      type: testAppointment.type,
      reason: testAppointment.reason
    };

    const approvalResult = await emailService.sendAppointmentStatusNotification(
      patient.email,
      appointmentData,
      'approved',
      'Your appointment has been confirmed. Please arrive 15 minutes early.'
    );

    console.log('Approval email result:', approvalResult);

    // Wait a moment between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Appointment Rejection Email
    console.log('\n=== Testing Appointment Rejection Email ===');
    const rejectionResult = await emailService.sendAppointmentStatusNotification(
      patient.email,
      appointmentData,
      'rejected',
      'Unfortunately, this time slot is no longer available. Please book another appointment.'
    );

    console.log('Rejection email result:', rejectionResult);

    // Clean up test appointment
    await Appointment.findByIdAndDelete(testAppointment._id);
    console.log('\n✅ Test appointment cleaned up');
    console.log('✅ Email notification test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testAppointmentStatusEmails();