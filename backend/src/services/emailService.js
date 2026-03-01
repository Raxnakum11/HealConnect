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
        user: process.env.EMAIL_USER || 'abc592052@gmail.com',
        pass: process.env.EMAIL_PASS || 'kpqo ettk cfgo zcrm'
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
        from: `HealConnect <${process.env.EMAIL_USER || 'abc592052@gmail.com'}>`,
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

  // Send medicine expiry alert notification
  async sendMedicineExpiryAlert(doctorEmail, medicineData) {
    const subject = '⚠️ Medicine Expiry Alert - HealConnect';
    const html = this.getMedicineExpiryTemplate(medicineData);
    
    return await this.sendEmail({
      to: doctorEmail,
      subject,
      html
    });
  }

  // Send low stock alert notification
  async sendLowStockAlert(doctorEmail, medicineData) {
    const subject = '📦 Low Stock Alert - HealConnect';
    const html = this.getLowStockTemplate(medicineData);
    
    return await this.sendEmail({
      to: doctorEmail,
      subject,
      html
    });
  }

  // Send combined medicine alerts (expiry + low stock)
  async sendMedicineAlerts(doctorEmail, alertData) {
    const subject = '🔔 Medicine Inventory Alert - HealConnect';
    const html = this.getMedicineAlertsTemplate(alertData);
    
    return await this.sendEmail({
      to: doctorEmail,
      subject,
      html
    });
  }

  // Template for medicine expiry alert
  getMedicineExpiryTemplate(data) {
    const medicineRows = data.medicines.map(med => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${med.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${med.batch}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${med.quantity} ${med.unit}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: ${med.daysToExpiry <= 7 ? '#ef4444' : '#f59e0b'}; font-weight: bold;">
          ${new Date(med.expiryDate).toLocaleDateString()} (${med.daysToExpiry} days)
        </td>
      </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .alert-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #f59e0b; color: white; padding: 12px; text-align: left; }
        .warning-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ HealConnect</h1>
          <h2>Medicine Expiry Alert</h2>
        </div>
        <div class="content">
          <div class="alert-card">
            <h3>Dear Doctor,</h3>
            <p>The following medicines in your inventory are expiring soon and require your attention:</p>
            
            <table>
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Batch</th>
                  <th>Quantity</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                ${medicineRows}
              </tbody>
            </table>
            
            <div class="warning-box">
              <h4>⚠️ Recommended Actions:</h4>
              <ul>
                <li>Review expiring medicines and plan disposal if necessary</li>
                <li>Prioritize using medicines expiring soon</li>
                <li>Reorder replacements before stock runs out</li>
                <li>Update inventory after taking action</li>
              </ul>
            </div>
            
            <p><strong>Total expiring medicines: ${data.medicines.length}</strong></p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated alert from HealConnect Medicine Inventory System.</p>
          <p>Generated at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Template for low stock alert
  getLowStockTemplate(data) {
    const medicineRows = data.medicines.map(med => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${med.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${med.batch}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: ${med.quantity <= 5 ? '#ef4444' : '#f59e0b'}; font-weight: bold;">
          ${med.quantity} ${med.unit}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${med.type}</td>
      </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .alert-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #ef4444; color: white; padding: 12px; text-align: left; }
        .critical-box { background: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 HealConnect</h1>
          <h2>Low Stock Alert</h2>
        </div>
        <div class="content">
          <div class="alert-card">
            <h3>Dear Doctor,</h3>
            <p>The following medicines in your inventory are running low and need restocking:</p>
            
            <table>
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Batch</th>
                  <th>Current Stock</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                ${medicineRows}
              </tbody>
            </table>
            
            <div class="critical-box">
              <h4>🔴 Immediate Action Required:</h4>
              <ul>
                <li>Reorder low stock medicines immediately</li>
                <li>Contact your suppliers for urgent deliveries</li>
                <li>Consider alternative medicines if needed</li>
                <li>Update inventory after restocking</li>
              </ul>
            </div>
            
            <p><strong>Total low stock items: ${data.medicines.length}</strong></p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated alert from HealConnect Medicine Inventory System.</p>
          <p>Generated at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Template for combined medicine alerts
  getMedicineAlertsTemplate(data) {
    const expiryRows = data.expiringMedicines?.length > 0 ? data.expiringMedicines.map(med => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.batch}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; color: #f59e0b; font-weight: bold;">
          ${new Date(med.expiryDate).toLocaleDateString()} (${med.daysToExpiry} days)
        </td>
      </tr>
    `).join('') : '';

    const lowStockRows = data.lowStockMedicines?.length > 0 ? data.lowStockMedicines.map(med => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.batch}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; color: #ef4444; font-weight: bold;">
          ${med.quantity} ${med.unit}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.type}</td>
      </tr>
    `).join('') : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .section { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
        .expiry-section { border-left: 4px solid #f59e0b; }
        .stock-section { border-left: 4px solid #ef4444; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th { padding: 10px; text-align: left; }
        .th-expiry { background: #f59e0b; color: white; }
        .th-stock { background: #ef4444; color: white; }
        .summary-box { background: #f3e8ff; border: 1px solid #7c3aed; padding: 15px; border-radius: 8px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 HealConnect</h1>
          <h2>Medicine Inventory Alert</h2>
        </div>
        <div class="content">
          <div class="summary-box">
            <h3>📊 Alert Summary</h3>
            <p>⚠️ <strong>Expiring Soon:</strong> ${data.expiringMedicines?.length || 0} medicines</p>
            <p>📦 <strong>Low Stock:</strong> ${data.lowStockMedicines?.length || 0} medicines</p>
          </div>
          
          ${data.expiringMedicines?.length > 0 ? `
          <div class="section expiry-section">
            <h3>⚠️ Medicines Expiring Soon (within ${data.expiryDays || 30} days)</h3>
            <table>
              <thead>
                <tr>
                  <th class="th-expiry">Medicine</th>
                  <th class="th-expiry">Batch</th>
                  <th class="th-expiry">Quantity</th>
                  <th class="th-expiry">Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                ${expiryRows}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          ${data.lowStockMedicines?.length > 0 ? `
          <div class="section stock-section">
            <h3>📦 Low Stock Medicines (below ${data.lowStockThreshold || 10} units)</h3>
            <table>
              <thead>
                <tr>
                  <th class="th-stock">Medicine</th>
                  <th class="th-stock">Batch</th>
                  <th class="th-stock">Current Stock</th>
                  <th class="th-stock">Type</th>
                </tr>
              </thead>
              <tbody>
                ${lowStockRows}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4>📋 Recommended Actions:</h4>
            <ul>
              <li>Review and dispose of expired or near-expiry medicines safely</li>
              <li>Reorder low stock medicines from suppliers</li>
              <li>Update your inventory records after taking action</li>
              <li>Set up regular inventory checks to prevent stockouts</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated alert from HealConnect Medicine Inventory System.</p>
          <p>Generated at: ${new Date().toLocaleString()}</p>
          <p style="color: #7c3aed;">📧 Alerts are sent to: ${data.alertEmail || 'codern1112@gmail.com'}</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Send appointment status notification (approved/rejected)
  async sendAppointmentStatusNotification(patientEmail, appointmentData, status, notes = '') {
    const subject = `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)} - HealConnect`;
    const html = this.getAppointmentStatusTemplate(appointmentData, status, notes);
    
    return await this.sendEmail({
      to: patientEmail,
      subject,
      html
    });
  }

  // Template for appointment status notifications
  getAppointmentStatusTemplate(data, status, notes = '') {
    const statusColors = {
      approved: { bg: '#10b981', icon: '✅', title: 'Appointment Approved' },
      rejected: { bg: '#ef4444', icon: '❌', title: 'Appointment Not Approved' },
      completed: { bg: '#8b5cf6', icon: '✔️', title: 'Appointment Completed' },
      cancelled: { bg: '#6b7280', icon: '⭕', title: 'Appointment Cancelled' }
    };

    const statusInfo = statusColors[status] || statusColors.approved;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${statusInfo.bg}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .status-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusInfo.bg}; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .btn { display: inline-block; background: ${statusInfo.bg}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        .status-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        .appointment-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .status-message { 
          padding: 15px; 
          border-radius: 8px; 
          margin: 15px 0; 
          ${status === 'approved' ? 'background: #d1fae5; border: 1px solid #10b981;' : 'background: #fee2e2; border: 1px solid #ef4444;'}
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 HealConnect</h1>
          <h2>${statusInfo.title}</h2>
        </div>
        <div class="content">
          <div class="status-icon">${statusInfo.icon}</div>
          
          <div class="status-card">
            <h3>Dear ${data.patientName},</h3>
            
            <div class="status-message">
              <p><strong>Your appointment has been ${status}.</strong></p>
              ${status === 'approved' ? 
                '<p>🎉 Great news! Your appointment has been confirmed. Please make sure to attend on the scheduled date and time.</p>' :
                '<p>We regret to inform you that your appointment could not be approved at this time.</p>'
              }
            </div>
            
            <div class="appointment-details">
              <h4>📅 Appointment Details:</h4>
              <ul>
                <li><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</li>
                <li><strong>Time:</strong> ${data.timeSlot || data.time}</li>
                <li><strong>Doctor:</strong> ${data.doctorName || 'Dr. Himanshu Sonagara'}</li>
                <li><strong>Type:</strong> ${data.type || 'General Consultation'}</li>
                <li><strong>Reason:</strong> ${data.reason}</li>
                <li><strong>Status:</strong> <span style="color: ${statusInfo.bg}; font-weight: bold;">${status.toUpperCase()}</span></li>
              </ul>
            </div>
            
            ${notes ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h4>📝 Doctor's Notes:</h4>
              <p>${notes}</p>
            </div>
            ` : ''}
            
            ${status === 'approved' ? `
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h4>📋 Important Instructions:</h4>
              <ul>
                <li>Please arrive 15 minutes before your appointment time</li>
                <li>Bring your previous medical records if any</li>
                <li>Carry a valid ID proof</li>
                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
              </ul>
            </div>
            ` : status === 'rejected' ? `
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h4>🔄 Next Steps:</h4>
              <ul>
                <li>You can book a new appointment for a different date/time</li>
                <li>Contact our support team if you have questions</li>
                <li>Consider booking during less busy hours</li>
              </ul>
            </div>
            ` : ''}
          </div>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:8080" class="btn">View Dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from HealConnect. Please do not reply to this email.</p>
          <p>For any queries, contact us at support@healconnect.com or call +91 98765 43210</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}

module.exports = EmailService;