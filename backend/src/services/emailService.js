const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Log environment variables for debugging (without exposing the password)
    console.log('EmailService: Initializing with user:', process.env.EMAIL_USER);
    console.log('EmailService: Password configured:', !!process.env.EMAIL_PASS);
    
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-gmail-app-password'
      },
      logger: true,
      debug: false // Set to true for more detailed SMTP logs
    });

    // Verify transporter configuration on initialization
    this.verifyConnection();
  }

  // Verify email service connection
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('EmailService: SMTP connection verified successfully');
    } catch (error) {
      console.error('EmailService: SMTP connection verification failed:', error.message);
      if (error.code === 'EAUTH') {
        console.error('EmailService: Gmail authentication failed. Please check:');
        console.error('  1. EMAIL_USER is correct Gmail address');
        console.error('  2. EMAIL_PASS is a valid Gmail App Password (not regular password)');
        console.error('  3. 2-Factor Authentication is enabled on Gmail account');
      }
    }
  }

  // Generic email sending method
  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: `HealConnect <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
        to,
        subject,
        html: html || text,
        text: text || undefined
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      // Detailed error logging for diagnosis
      if (error.response) {
        console.error('SMTP Response:', error.response);
      }
      if (error.code === 'EAUTH') {
        console.error('Gmail authentication failed. Check EMAIL_USER and EMAIL_PASS in .env.');
      }
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNECTION') {
        console.error('SMTP server connection failed. Check internet and Gmail SMTP settings.');
      }
      return { success: false, error: error.message, code: error.code, response: error.response };
    }
  }

  // Send appointment notification
  async sendAppointmentNotification(patientEmail, appointmentData) {
    const subject = 'Appointment Confirmation - HealConnect';
    const html = this.getAppointmentTemplate(appointmentData);
    
    return await this.sendEmail({
      to: patientEmail,
      subject,
      html
    });
  }

  // Send prescription notification
  async sendPrescriptionNotification(patientEmail, prescriptionData) {
    const subject = 'New Prescription Available - HealConnect';
    const html = this.getPrescriptionTemplate(prescriptionData);
    
    return await this.sendEmail({
      to: patientEmail,
      subject,
      html
    });
  }

  // Send medical report notification
  async sendReportNotification(patientEmail, reportData) {
    const subject = 'Medical Report Available - HealConnect';
    const html = this.getReportTemplate(reportData);
    
    return await this.sendEmail({
      to: patientEmail,
      subject,
      html
    });
  }

  // Send camp notification
  async sendCampNotification(patientEmail, campData) {
    const subject = 'Medical Camp Announcement - HealConnect';
    const html = this.getCampTemplate(campData);
    
    return await this.sendEmail({
      to: patientEmail,
      subject,
      html
    });
  }

  // Send general notification
  async sendGeneralNotification(patientEmail, notificationData) {
    const subject = notificationData.title || 'Notification from HealConnect';
    const html = this.getGeneralTemplate(notificationData);
    
    return await this.sendEmail({
      to: patientEmail,
      subject,
      html
    });
  }

  // Email Templates
  getAppointmentTemplate(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .appointment-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 HealConnect</h1>
          <h2>Appointment Confirmation</h2>
        </div>
        <div class="content">
          <div class="appointment-card">
            <h3>Dear ${data.patientName},</h3>
            <p>Your appointment has been scheduled successfully!</p>
            
            <h4>📅 Appointment Details:</h4>
            <ul>
              <li><strong>Date:</strong> ${data.date}</li>
              <li><strong>Time:</strong> ${data.time}</li>
              <li><strong>Doctor:</strong> ${data.doctorName}</li>
              <li><strong>Type:</strong> ${data.type || 'General Consultation'}</li>
              ${data.location ? `<li><strong>Location:</strong> ${data.location}</li>` : ''}
            </ul>
            
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Please arrive 15 minutes before your appointment time</li>
              <li>Bring your previous medical records if any</li>
              <li>Carry a valid ID proof</li>
            </ul>
          </div>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:8080" class="btn">View in Dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from HealConnect. Please do not reply to this email.</p>
          <p>For any queries, contact us at support@healconnect.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getPrescriptionTemplate(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .prescription-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; }
        .medicine-list { background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .btn { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💊 HealConnect</h1>
          <h2>New Prescription Available</h2>
        </div>
        <div class="content">
          <div class="prescription-card">
            <h3>Dear ${data.patientName},</h3>
            <p>Your prescription is ready for collection.</p>
            
            <h4>📋 Prescription Details:</h4>
            <ul>
              <li><strong>Prescription ID:</strong> ${data.prescriptionId}</li>
              <li><strong>Date:</strong> ${data.date}</li>
              <li><strong>Doctor:</strong> ${data.doctorName}</li>
            </ul>
            
            ${data.medicines && data.medicines.length > 0 ? `
            <div class="medicine-list">
              <h4>💊 Prescribed Medicines:</h4>
              <ul>
                ${data.medicines.map(med => `<li><strong>${med.name}</strong> - ${med.dosage} (${med.frequency})</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Take medicines as prescribed by your doctor</li>
              <li>Complete the full course even if you feel better</li>
              <li>Contact your doctor if you experience any side effects</li>
            </ul>
          </div>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:8080" class="btn">View Prescription</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from HealConnect. Please do not reply to this email.</p>
          <p>For any queries, contact us at support@healconnect.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getReportTemplate(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .report-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .btn { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 HealConnect</h1>
          <h2>Medical Report Available</h2>
        </div>
        <div class="content">
          <div class="report-card">
            <h3>Dear ${data.patientName},</h3>
            <p>Your medical report is now available for review.</p>
            
            <h4>📊 Report Details:</h4>
            <ul>
              <li><strong>Report Type:</strong> ${data.reportType}</li>
              <li><strong>Date:</strong> ${data.date}</li>
              <li><strong>Doctor:</strong> ${data.doctorName}</li>
              ${data.testResults ? `<li><strong>Status:</strong> ${data.testResults}</li>` : ''}
            </ul>
            
            ${data.summary ? `
            <p><strong>Summary:</strong></p>
            <p style="background: #f0f9ff; padding: 10px; border-radius: 5px;">${data.summary}</p>
            ` : ''}
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review your report in your patient dashboard</li>
              <li>Follow up with your doctor if needed</li>
              <li>Keep this report for your medical records</li>
            </ul>
          </div>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:8080" class="btn">View Report</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from HealConnect. Please do not reply to this email.</p>
          <p>For any queries, contact us at support@healconnect.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getCampTemplate(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .camp-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .btn { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⛺ HealConnect</h1>
          <h2>Medical Camp Announcement</h2>
        </div>
        <div class="content">
          <div class="camp-card">
            <h3>Dear ${data.patientName},</h3>
            <p>We're organizing a medical camp in your area!</p>
            
            <h4>⛺ Camp Details:</h4>
            <ul>
              <li><strong>Camp Name:</strong> ${data.campName}</li>
              <li><strong>Date:</strong> ${data.date}</li>
              <li><strong>Time:</strong> ${data.time}</li>
              <li><strong>Location:</strong> ${data.location}</li>
              <li><strong>Contact:</strong> ${data.contactInfo}</li>
            </ul>
            
            ${data.services ? `
            <h4>🩺 Available Services:</h4>
            <ul>
              ${data.services.split(',').map(service => `<li>${service.trim()}</li>`).join('')}
            </ul>
            ` : ''}
            
            <p><strong>Benefits:</strong></p>
            <ul>
              <li>Free health checkup</li>
              <li>Consultation with qualified doctors</li>
              <li>Basic diagnostic tests</li>
              <li>Health awareness sessions</li>
            </ul>
          </div>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:8080" class="btn">View Camp Details</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from HealConnect. Please do not reply to this email.</p>
          <p>For any queries, contact us at support@healconnect.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getGeneralTemplate(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0891b2; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .notification-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #0891b2; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .btn { display: inline-block; background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 HealConnect</h1>
          <h2>${data.title || 'Notification'}</h2>
        </div>
        <div class="content">
          <div class="notification-card">
            <h3>Dear ${data.patientName},</h3>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              ${data.message}
            </div>
            
            ${data.actionRequired ? `
            <p><strong>Action Required:</strong></p>
            <p style="background: #fef3c7; padding: 10px; border-radius: 5px;">${data.actionRequired}</p>
            ` : ''}
          </div>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:8080" class="btn">View Dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from HealConnect. Please do not reply to this email.</p>
          <p>For any queries, contact us at support@healconnect.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}

module.exports = EmailService;