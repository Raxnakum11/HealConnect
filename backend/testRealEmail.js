// Direct Email Test with explicit credentials
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

console.log('🏥 HealConnect - Real Email Test to patelaryan2106@gmail.com\n');

// Read .env file manually to ensure variables are loaded
const envPath = path.join(__dirname, '.env');
console.log('📁 Environment file path:', envPath);
console.log('📁 File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 Environment file content (email section):');
  const lines = envContent.split('\n');
  const emailLines = lines.filter(line => line.includes('EMAIL'));
  emailLines.forEach(line => console.log('  ', line));
}

// Use the credentials directly for guaranteed delivery
const EMAIL_USER = 'abc592052@gmail.com';
const EMAIL_PASS = 'kpqo ettk cfgo zcrm';

console.log('\n✅ Using credentials:');
console.log('📧 Email:', EMAIL_USER);
console.log('🔑 Password:', EMAIL_PASS.replace(/./g, '*'));

async function sendRealDemoEmail() {
  console.log('\n📤 Creating email transporter...');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    },
    debug: true // Enable debug logging
  });

  console.log('✅ Transporter created successfully');

  const demoEmail = {
    from: `"🏥 HealConnect System" <${EMAIL_USER}>`,
    to: 'patelaryan2106@gmail.com',
    subject: '🏥 HealConnect - REAL Email Notification Test ✅',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HealConnect Demo</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
          .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 30px; }
          .success-box { background: #d4edda; border: 2px solid #28a745; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
          .feature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0; }
          .feature-item { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
          .footer { background: #343a40; color: white; padding: 20px; text-align: center; }
          .highlight { color: #007bff; font-weight: bold; }
          .timestamp { background: #e9ecef; padding: 10px; border-radius: 5px; margin: 15px 0; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1 style="margin: 0; font-size: 36px;">🏥 HealConnect</h1>
            <p style="margin: 15px 0 0 0; font-size: 20px; opacity: 0.9;">Real-Time Healthcare Management</p>
          </div>
          
          <div class="content">
            <div class="success-box">
              <h2 style="color: #28a745; margin: 0 0 10px 0;">✅ EMAIL SYSTEM WORKING!</h2>
              <p style="color: #155724; margin: 0; font-size: 18px;">This is a <strong>REAL EMAIL</strong> sent to demonstrate the system!</p>
            </div>
            
            <h3>🎉 Hello patelaryan2106@gmail.com!</h3>
            <p>Congratulations! The HealConnect email notification system is now <span class="highlight">fully operational</span> and sending real emails to patients.</p>
            
            <div class="timestamp">
              <strong>📊 Email Details:</strong><br>
              📅 Date: ${new Date().toLocaleDateString()}<br>
              ⏰ Time: ${new Date().toLocaleTimeString()}<br>
              📧 From: ${EMAIL_USER}<br>
              📨 To: patelaryan2106@gmail.com<br>
              🚀 Status: <span style="color: #28a745;">Successfully Delivered</span>
            </div>
            
            <h4>🏥 Available Notification Types:</h4>
            <div class="feature-grid">
              <div class="feature-item">
                <strong>📅 Appointments</strong><br>
                <small>Booking confirmations & reminders</small>
              </div>
              <div class="feature-item">
                <strong>💊 Prescriptions</strong><br>
                <small>Medicine alerts & instructions</small>
              </div>
              <div class="feature-item">
                <strong>📋 Reports</strong><br>
                <small>Lab results & medical reports</small>
              </div>
              <div class="feature-item">
                <strong>🏕️ Medical Camps</strong><br>
                <small>Health camp announcements</small>
              </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #856404; margin: 0 0 10px 0;">⚡ Real-Time Features:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Instant email delivery</li>
                <li>Professional HTML templates</li>
                <li>Mobile-responsive design</li>
                <li>Doctor dashboard integration</li>
                <li>Patient-friendly interface</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 15px 30px; border-radius: 25px; display: inline-block; font-size: 18px; font-weight: bold;">
                🎯 DEMO SUCCESSFUL!
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0 0 10px 0; font-size: 18px;">© 2025 HealConnect</p>
            <p style="margin: 0; opacity: 0.8;">Your Health, Our Priority 💙</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.7;">Powered by Real-Time Email Notifications</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
HealConnect - REAL Email Notification Test

EMAIL SYSTEM WORKING!

Hello patelaryan2106@gmail.com!

Congratulations! The HealConnect email notification system is now fully operational and sending real emails to patients.

Email Details:
📅 Date: ${new Date().toLocaleDateString()}
⏰ Time: ${new Date().toLocaleTimeString()}
📧 From: ${EMAIL_USER}
📨 To: patelaryan2106@gmail.com
🚀 Status: Successfully Delivered

Available Notification Types:
📅 Appointments - Booking confirmations & reminders
💊 Prescriptions - Medicine alerts & instructions  
📋 Reports - Lab results & medical reports
🏕️ Medical Camps - Health camp announcements

Real-Time Features:
• Instant email delivery
• Professional HTML templates
• Mobile-responsive design  
• Doctor dashboard integration
• Patient-friendly interface

DEMO SUCCESSFUL!

© 2025 HealConnect - Your Health, Our Priority
Powered by Real-Time Email Notifications
    `
  };

  try {
    console.log('📧 Preparing to send email...');
    console.log('  From:', EMAIL_USER);
    console.log('  To: patelaryan2106@gmail.com');
    console.log('  Subject: 🏥 HealConnect - REAL Email Notification Test ✅');
    console.log('');
    
    console.log('📤 Sending email...');
    const result = await transporter.sendMail(demoEmail);
    
    console.log('\n🎉 SUCCESS! Real email sent successfully!');
    console.log('═══════════════════════════════════════════════');
    console.log('✅ Email delivered to: patelaryan2106@gmail.com');
    console.log('📨 Message ID:', result.messageId);
    console.log('📧 From:', EMAIL_USER);
    console.log('🕐 Sent at:', new Date().toLocaleString());
    console.log('📱 Response:', result.response);
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('🎯 The recipient will receive:');
    console.log('   ✅ Professional HTML email with HealConnect branding');
    console.log('   ✅ Beautiful responsive design for mobile/desktop');
    console.log('   ✅ Complete system demonstration and features');
    console.log('   ✅ Real-time delivery timestamp');
    console.log('');
    console.log('🚀 HealConnect Email System is FULLY OPERATIONAL!');
    
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('\n❌ Email sending failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔐 Authentication Error - Possible causes:');
      console.error('   • App password might be incorrect');
      console.error('   • 2-Factor Authentication not enabled');
      console.error('   • Less secure app access disabled');
    }
    
    return { success: false, error: error.message };
  }
}

// Execute the email test
sendRealDemoEmail()
  .then(result => {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║           FINAL RESULT               ║');
    console.log('╚══════════════════════════════════════╝');
    
    if (result.success) {
      console.log('🎉 REAL EMAIL SENT SUCCESSFULLY!');
      console.log('✅ HealConnect email system is working!');
      console.log('📧 Check patelaryan2106@gmail.com inbox');
      console.log('🚀 System ready for patient notifications!');
    } else {
      console.log('❌ Email sending failed');
      console.log('Error:', result.error);
    }
  })
  .catch(error => {
    console.error('Script execution error:', error);
  });