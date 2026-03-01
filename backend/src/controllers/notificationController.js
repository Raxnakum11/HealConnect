const EmailService = require('../services/emailService');
const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

const emailService = new EmailService();

// @desc    Send email notification to patient
// @route   POST /api/notifications/email
// @access  Private (Doctor only)
const sendEmailNotification = asyncHandler(async (req, res) => {
  const {
    patientId,
    type, // 'appointment', 'prescription', 'report', 'camp', 'general'
    data // Contains specific data for each notification type
  } = req.body;

  // Get patient details
  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Check if patient has email
  if (!patient.email) {
    return res.status(400).json({
      success: false,
      message: 'Patient email not found. Please add patient email address first.'
    });
  }

  let emailResult;
  const patientEmail = patient.email;
  const patientName = patient.name;

  try {
    switch (type) {
      case 'appointment':
        emailResult = await emailService.sendAppointmentNotification(patientEmail, {
          ...data,
          patientName
        });
        break;

      case 'prescription':
        emailResult = await emailService.sendPrescriptionNotification(patientEmail, {
          ...data,
          patientName
        });
        break;

      case 'report':
        emailResult = await emailService.sendReportNotification(patientEmail, {
          ...data,
          patientName
        });
        break;

      case 'camp':
        emailResult = await emailService.sendCampNotification(patientEmail, {
          ...data,
          patientName
        });
        break;

      case 'general':
        emailResult = await emailService.sendGeneralNotification(patientEmail, {
          ...data,
          patientName
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid notification type'
        });
    }

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: emailResult.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email service error',
      error: error.message
    });
  }
});

// @desc    Send bulk email notifications
// @route   POST /api/notifications/email/bulk
// @access  Private (Doctor only)
const sendBulkEmailNotifications = asyncHandler(async (req, res) => {
  const {
    patientIds, // Array of patient IDs
    type,
    data
  } = req.body;

  if (!patientIds || patientIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Patient IDs are required'
    });
  }

  const results = [];
  const patients = await Patient.find({ _id: { $in: patientIds } });

  for (const patient of patients) {
    if (!patient.email) {
      results.push({
        patientId: patient._id,
        patientName: patient.name,
        success: false,
        message: 'No email address found'
      });
      continue;
    }

    try {
      let emailResult;
      const patientEmail = patient.email;
      const patientName = patient.name;

      switch (type) {
        case 'appointment':
          emailResult = await emailService.sendAppointmentNotification(patientEmail, {
            ...data,
            patientName
          });
          break;

        case 'prescription':
          emailResult = await emailService.sendPrescriptionNotification(patientEmail, {
            ...data,
            patientName
          });
          break;

        case 'report':
          emailResult = await emailService.sendReportNotification(patientEmail, {
            ...data,
            patientName
          });
          break;

        case 'camp':
          emailResult = await emailService.sendCampNotification(patientEmail, {
            ...data,
            patientName
          });
          break;

        case 'general':
          emailResult = await emailService.sendGeneralNotification(patientEmail, {
            ...data,
            patientName
          });
          break;

        default:
          results.push({
            patientId: patient._id,
            patientName: patient.name,
            success: false,
            message: 'Invalid notification type'
          });
          continue;
      }

      results.push({
        patientId: patient._id,
        patientName: patient.name,
        success: emailResult.success,
        message: emailResult.success ? 'Email sent successfully' : emailResult.error,
        messageId: emailResult.messageId
      });

    } catch (error) {
      results.push({
        patientId: patient._id,
        patientName: patient.name,
        success: false,
        message: error.message
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;

  res.status(200).json({
    success: true,
    message: `Bulk email operation completed. ${successCount} sent, ${failureCount} failed.`,
    results,
    summary: {
      total: results.length,
      successful: successCount,
      failed: failureCount
    }
  });
});

// @desc    Test email configuration
// @route   POST /api/notifications/email/test
// @access  Private (Doctor only)
const testEmailConfiguration = asyncHandler(async (req, res) => {
  const { testEmail } = req.body;

  if (!testEmail) {
    return res.status(400).json({
      success: false,
      message: 'Test email address is required'
    });
  }

  try {
    const emailResult = await emailService.sendEmail({
      to: testEmail,
      subject: 'HealConnect Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">🎉 Email Configuration Test</h2>
          <p>Congratulations! Your HealConnect email service is working correctly.</p>
          <p><strong>Test performed at:</strong> ${new Date().toLocaleString()}</p>
          <p style="color: #059669;"><strong>✅ Email service is properly configured!</strong></p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is a test email from HealConnect notification system.</p>
        </div>
      `
    });

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: 'Test email sent successfully! Check your inbox.',
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Test email failed to send',
        error: emailResult.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email service error',
      error: error.message
    });
  }
});

// @desc    Get email notification history
// @route   GET /api/notifications/email/history
// @access  Private (Doctor only)
const getEmailHistory = asyncHandler(async (req, res) => {
  // This would typically come from a database table storing email logs
  // For now, returning a mock response
  res.status(200).json({
    success: true,
    message: 'Email history retrieved successfully',
    data: {
      history: [
        // This would be populated from email logs table
        {
          id: '1',
          patientName: 'John Doe',
          email: 'john@example.com',
          type: 'appointment',
          subject: 'Appointment Confirmation',
          status: 'sent',
          timestamp: new Date().toISOString()
        }
      ],
      pagination: {
        current: 1,
        pages: 1,
        total: 0
      }
    }
  });
});

// Hardcoded alert email (will be changed to doctor's email later)
const ALERT_EMAIL = 'codern1112@gmail.com';

// @desc    Check and send medicine expiry alerts
// @route   POST /api/notifications/medicine/expiry-alert
// @access  Private (Doctor only)
const sendMedicineExpiryAlert = asyncHandler(async (req, res) => {
  const { expiryDays = 30 } = req.body; // Default: medicines expiring within 30 days
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  
  // Find medicines expiring soon for this doctor
  const expiringMedicines = await Medicine.find({
    doctorId: req.user.id,
    isActive: true,
    expiryDate: { $lte: expiryDate, $gt: new Date() }
  }).sort({ expiryDate: 1 });
  
  if (expiringMedicines.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No medicines expiring soon. No alert sent.',
      data: { expiringCount: 0 }
    });
  }
  
  // Transform medicines for email template
  const medicinesData = expiringMedicines.map(med => ({
    name: med.name,
    batch: med.batch,
    quantity: med.quantity,
    unit: med.unit,
    expiryDate: med.expiryDate,
    daysToExpiry: Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
    type: med.type
  }));
  
  // Send alert to hardcoded email (will be doctor's email later)
  // TODO: Change to doctor's email: const doctorEmail = req.user.email;
  const alertEmail = ALERT_EMAIL;
  
  const emailResult = await emailService.sendMedicineExpiryAlert(alertEmail, {
    medicines: medicinesData,
    expiryDays
  });
  
  if (emailResult.success) {
    res.status(200).json({
      success: true,
      message: `Expiry alert sent to ${alertEmail}`,
      data: {
        expiringCount: expiringMedicines.length,
        medicines: medicinesData,
        emailSentTo: alertEmail
      }
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to send expiry alert email',
      error: emailResult.error
    });
  }
});

// @desc    Check and send low stock alerts
// @route   POST /api/notifications/medicine/low-stock-alert
// @access  Private (Doctor only)
const sendLowStockAlert = asyncHandler(async (req, res) => {
  const { threshold = 10 } = req.body; // Default: medicines with quantity <= 10
  
  // Find low stock medicines for this doctor
  const lowStockMedicines = await Medicine.find({
    doctorId: req.user.id,
    isActive: true,
    quantity: { $lte: threshold }
  }).sort({ quantity: 1 });
  
  if (lowStockMedicines.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No low stock medicines found. No alert sent.',
      data: { lowStockCount: 0 }
    });
  }
  
  // Transform medicines for email template
  const medicinesData = lowStockMedicines.map(med => ({
    name: med.name,
    batch: med.batch,
    quantity: med.quantity,
    unit: med.unit,
    type: med.type,
    expiryDate: med.expiryDate
  }));
  
  // Send alert to hardcoded email (will be doctor's email later)
  // TODO: Change to doctor's email: const doctorEmail = req.user.email;
  const alertEmail = ALERT_EMAIL;
  
  const emailResult = await emailService.sendLowStockAlert(alertEmail, {
    medicines: medicinesData,
    threshold
  });
  
  if (emailResult.success) {
    res.status(200).json({
      success: true,
      message: `Low stock alert sent to ${alertEmail}`,
      data: {
        lowStockCount: lowStockMedicines.length,
        medicines: medicinesData,
        emailSentTo: alertEmail
      }
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to send low stock alert email',
      error: emailResult.error
    });
  }
});

// @desc    Check and send combined medicine alerts (expiry + low stock)
// @route   POST /api/notifications/medicine/alerts
// @access  Private (Doctor only)
const sendMedicineAlerts = asyncHandler(async (req, res) => {
  const { expiryDays = 30, lowStockThreshold = 10 } = req.body;
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  
  // Find expiring medicines
  const expiringMedicines = await Medicine.find({
    doctorId: req.user.id,
    isActive: true,
    expiryDate: { $lte: expiryDate, $gt: new Date() }
  }).sort({ expiryDate: 1 });
  
  // Find low stock medicines
  const lowStockMedicines = await Medicine.find({
    doctorId: req.user.id,
    isActive: true,
    quantity: { $lte: lowStockThreshold }
  }).sort({ quantity: 1 });
  
  if (expiringMedicines.length === 0 && lowStockMedicines.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No medicine alerts. Inventory is healthy!',
      data: { expiringCount: 0, lowStockCount: 0 }
    });
  }
  
  // Transform medicines data
  const expiringData = expiringMedicines.map(med => ({
    name: med.name,
    batch: med.batch,
    quantity: med.quantity,
    unit: med.unit,
    expiryDate: med.expiryDate,
    daysToExpiry: Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
    type: med.type
  }));
  
  const lowStockData = lowStockMedicines.map(med => ({
    name: med.name,
    batch: med.batch,
    quantity: med.quantity,
    unit: med.unit,
    type: med.type
  }));
  
  // Send combined alert
  // TODO: Change to doctor's email: const doctorEmail = req.user.email;
  const alertEmail = ALERT_EMAIL;
  
  const emailResult = await emailService.sendMedicineAlerts(alertEmail, {
    expiringMedicines: expiringData,
    lowStockMedicines: lowStockData,
    expiryDays,
    lowStockThreshold,
    alertEmail
  });
  
  if (emailResult.success) {
    res.status(200).json({
      success: true,
      message: `Medicine alerts sent to ${alertEmail}`,
      data: {
        expiringCount: expiringMedicines.length,
        lowStockCount: lowStockMedicines.length,
        expiringMedicines: expiringData,
        lowStockMedicines: lowStockData,
        emailSentTo: alertEmail
      }
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to send medicine alerts',
      error: emailResult.error
    });
  }
});

// @desc    Get medicine alert status (preview without sending)
// @route   GET /api/notifications/medicine/status
// @access  Private (Doctor only)
const getMedicineAlertStatus = asyncHandler(async (req, res) => {
  const expiryDays = parseInt(req.query.expiryDays) || 30;
  const lowStockThreshold = parseInt(req.query.threshold) || 10;
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  
  // Find expiring medicines
  const expiringMedicines = await Medicine.find({
    doctorId: req.user.id,
    isActive: true,
    expiryDate: { $lte: expiryDate, $gt: new Date() }
  }).sort({ expiryDate: 1 });
  
  // Find low stock medicines
  const lowStockMedicines = await Medicine.find({
    doctorId: req.user.id,
    isActive: true,
    quantity: { $lte: lowStockThreshold }
  }).sort({ quantity: 1 });
  
  // Critical: expiring in 7 days or quantity <= 5
  const criticalExpiryDate = new Date();
  criticalExpiryDate.setDate(criticalExpiryDate.getDate() + 7);
  
  const criticalExpiring = expiringMedicines.filter(med => new Date(med.expiryDate) <= criticalExpiryDate);
  const criticalLowStock = lowStockMedicines.filter(med => med.quantity <= 5);
  
  res.status(200).json({
    success: true,
    message: 'Medicine alert status retrieved',
    data: {
      summary: {
        totalExpiring: expiringMedicines.length,
        totalLowStock: lowStockMedicines.length,
        criticalExpiring: criticalExpiring.length,
        criticalLowStock: criticalLowStock.length,
        needsAttention: expiringMedicines.length > 0 || lowStockMedicines.length > 0
      },
      expiringMedicines: expiringMedicines.map(med => ({
        id: med._id,
        name: med.name,
        batch: med.batch,
        quantity: med.quantity,
        unit: med.unit,
        expiryDate: med.expiryDate,
        daysToExpiry: Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
        isCritical: new Date(med.expiryDate) <= criticalExpiryDate
      })),
      lowStockMedicines: lowStockMedicines.map(med => ({
        id: med._id,
        name: med.name,
        batch: med.batch,
        quantity: med.quantity,
        unit: med.unit,
        type: med.type,
        isCritical: med.quantity <= 5
      })),
      alertEmail: ALERT_EMAIL,
      parameters: { expiryDays, lowStockThreshold }
    }
  });
});

module.exports = {
  sendEmailNotification,
  sendBulkEmailNotifications,
  testEmailConfiguration,
  getEmailHistory,
  sendMedicineExpiryAlert,
  sendLowStockAlert,
  sendMedicineAlerts,
  getMedicineAlertStatus
};