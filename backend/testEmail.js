const nodemailer = require('nodemailer');
require('dotenv').config();

// Test email configuration
async function testEmailSending() {
  console.log('Testing Email Configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Password is set' : 'Password not set');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Test email content
  const testEmailOptions = {
    from: `HealConnect Demo <${process.env.EMAIL_USER}>`,
    to: 'abc592052@gmail.com',
    subject: '🏥 HealConnect Email System Test - Success!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { background-color: #333; color: white; padding: 10px; text-align: center; }
          .success-badge { background-color: #28a745; color: white; padding: 5px 10px; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 HealConnect</h1>
          <h2>Email System Test</h2>
        </div>
        <div class="content">
          <div class="success-badge">✅ EMAIL SYSTEM WORKING!</div>
          <h3>Hello from HealConnect!</h3>
          <p>This is a test email to verify that our real-time email notification system is working perfectly.</p>
          
          <h4>📧 Email System Features:</h4>
          <ul>
            <li>✅ Real-time email notifications</li>
            <li>✅ Professional HTML templates</li>
            <li>✅ Patient notification system</li>
            <li>✅ Doctor dashboard integration</li>
            <li>✅ Appointment notifications</li>
            <li>✅ Prescription alerts</li>
            <li>✅ Medical report notifications</li>
            <li>✅ Medical camp announcements</li>
          </ul>

          <p><strong>Test Details:</strong></p>
          <ul>
            <li>📅 Date: ${new Date().toLocaleDateString()}</li>
            <li>⏰ Time: ${new Date().toLocaleTimeString()}</li>
            <li>📧 To: abc592052@gmail.com</li>
            <li>🏥 From: HealConnect System</li>
          </ul>

          <p>🎉 <strong>Congratulations!</strong> Your email notification system is now fully operational and ready to send real-time notifications to patients.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 HealConnect - Your Health, Our Priority</p>
          <p>📱 Real-time Healthcare Management System</p>
        </div>
      </body>
      </html>
    `,
    text: `
      HealConnect Email System Test - SUCCESS!
      
      Hello from HealConnect!
      
      This is a test email to verify that our real-time email notification system is working perfectly.
      
      Email System Features:
      - Real-time email notifications
      - Professional HTML templates  
      - Patient notification system
      - Doctor dashboard integration
      - Appointment notifications
      - Prescription alerts
      - Medical report notifications
      - Medical camp announcements
      
      Test Details:
      - Date: ${new Date().toLocaleDateString()}
      - Time: ${new Date().toLocaleTimeString()}
      - To: abc592052@gmail.com
      - From: HealConnect System
      
      Congratulations! Your email notification system is now fully operational.
      
      © 2025 HealConnect - Your Health, Our Priority
    `
  };

  try {
    console.log('Sending test email to abc592052@gmail.com...');
    const info = await transporter.sendMail(testEmailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check your email credentials.');
    }
    return { success: false, error: error.message };
  }
}

// Run the test
testEmailSending()
  .then(result => {
    console.log('\n=== TEST RESULT ===');
    if (result.success) {
      console.log('🎉 EMAIL SYSTEM IS WORKING!');
      console.log('✅ Successfully sent test email to abc592052@gmail.com');
      console.log('📧 Check your inbox for the test email.');
    } else {
      console.log('❌ Email system test failed');
      console.log('Error:', result.error);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Test script error:', error);
    process.exit(1);
  });