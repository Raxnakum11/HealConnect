const EmailService = require('../services/emailService');
const Patient = require('../models/Patient');
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

module.exports = {
  sendEmailNotification,
  sendBulkEmailNotifications,
  testEmailConfiguration,
  getEmailHistory
};