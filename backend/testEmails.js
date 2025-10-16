// Simple test for appointment status email notifications
const mongoose = require('mongoose');
const EmailService = require('./src/services/emailService');

async function testEmailTemplates() {
  try {
    console.log('=== Testing Appointment Status Email Templates ===');

    // Initialize email service
    const emailService = new EmailService();

    // Test appointment data
    const appointmentData = {
      patientName: 'Raxeet Nakum',
      doctorName: 'Dr. Himanshu Sonagara',
      date: new Date('2025-10-15'),
      time: '10:30 AM',
      timeSlot: '10:30 AM',
      type: 'checkup',
      reason: 'Health checkup'
    };

    // Test 1: Appointment Approval Email
    console.log('\n📧 Testing Appointment Approval Email...');
    const approvalResult = await emailService.sendAppointmentStatusNotification(
      'nakumrax11@gmail.com',
      appointmentData,
      'approved',
      'Your appointment has been confirmed. Please arrive 15 minutes early.'
    );

    if (approvalResult.success) {
      console.log('✅ Approval email sent successfully!');
      console.log('Message ID:', approvalResult.messageId);
    } else {
      console.log('❌ Approval email failed:', approvalResult.error);
    }

    // Wait 3 seconds between emails
    console.log('\n⏳ Waiting 3 seconds before sending rejection email...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 2: Appointment Rejection Email
    console.log('\n📧 Testing Appointment Rejection Email...');
    const rejectionResult = await emailService.sendAppointmentStatusNotification(
      'nakumrax11@gmail.com',
      appointmentData,
      'rejected',
      'Unfortunately, this time slot is no longer available. Please book another appointment.'
    );

    if (rejectionResult.success) {
      console.log('✅ Rejection email sent successfully!');
      console.log('Message ID:', rejectionResult.messageId);
    } else {
      console.log('❌ Rejection email failed:', rejectionResult.error);
    }

    console.log('\n🎉 Email notification test completed!');
    console.log('📬 Check your email inbox (nakumrax11@gmail.com) for the notifications.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testEmailTemplates();