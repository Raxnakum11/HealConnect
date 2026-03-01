const express = require('express');
const {
  sendEmailNotification,
  sendBulkEmailNotifications,
  testEmailConfiguration,
  getEmailHistory,
  sendMedicineExpiryAlert,
  sendLowStockAlert,
  sendMedicineAlerts,
  getMedicineAlertStatus
} = require('../controllers/notificationController');
const { authenticateToken, requireDoctor } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { body } = require('express-validator');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Email notification validation
const emailNotificationValidation = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isMongoId()
    .withMessage('Invalid patient ID'),
  
  body('type')
    .isIn(['appointment', 'prescription', 'report', 'camp', 'general'])
    .withMessage('Invalid notification type'),
  
  body('data')
    .isObject()
    .withMessage('Notification data is required')
];

const bulkEmailValidation = [
  body('patientIds')
    .isArray({ min: 1 })
    .withMessage('At least one patient ID is required')
    .custom((patientIds) => {
      return patientIds.every(id => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/));
    })
    .withMessage('Invalid patient IDs'),
  
  body('type')
    .isIn(['appointment', 'prescription', 'report', 'camp', 'general'])
    .withMessage('Invalid notification type'),
  
  body('data')
    .isObject()
    .withMessage('Notification data is required')
];

const testEmailValidation = [
  body('testEmail')
    .isEmail()
    .withMessage('Valid test email address is required')
];

// @route   POST /api/notifications/email
// @desc    Send email notification to a patient
// @access  Private (Doctor only)
router.post(
  '/email',
  requireDoctor,
  emailNotificationValidation,
  handleValidationErrors,
  sendEmailNotification
);

// @route   POST /api/notifications/email/bulk
// @desc    Send bulk email notifications
// @access  Private (Doctor only)
router.post(
  '/email/bulk',
  requireDoctor,
  bulkEmailValidation,
  handleValidationErrors,
  sendBulkEmailNotifications
);

// @route   POST /api/notifications/email/test
// @desc    Test email configuration
// @access  Private (Doctor only)
router.post(
  '/email/test',
  requireDoctor,
  testEmailValidation,
  handleValidationErrors,
  testEmailConfiguration
);

// @route   GET /api/notifications/email/history
// @desc    Get email notification history
// @access  Private (Doctor only)
router.get(
  '/email/history',
  requireDoctor,
  getEmailHistory
);

// ==================== MEDICINE ALERT ROUTES ====================

// @route   GET /api/notifications/medicine/status
// @desc    Get medicine alert status (preview without sending)
// @access  Private (Doctor only)
router.get(
  '/medicine/status',
  requireDoctor,
  getMedicineAlertStatus
);

// @route   POST /api/notifications/medicine/expiry-alert
// @desc    Send medicine expiry alert email
// @access  Private (Doctor only)
router.post(
  '/medicine/expiry-alert',
  requireDoctor,
  sendMedicineExpiryAlert
);

// @route   POST /api/notifications/medicine/low-stock-alert
// @desc    Send low stock alert email
// @access  Private (Doctor only)
router.post(
  '/medicine/low-stock-alert',
  requireDoctor,
  sendLowStockAlert
);

// @route   POST /api/notifications/medicine/alerts
// @desc    Send combined medicine alerts (expiry + low stock)
// @access  Private (Doctor only)
router.post(
  '/medicine/alerts',
  requireDoctor,
  sendMedicineAlerts
);

module.exports = router;