const express = require('express');
const {
  createAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentStats
} = require('../controllers/appointmentController');
const { authenticateToken, requireDoctor } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { body, param, query } = require('express-validator');

const router = express.Router();

// Validation middleware
const createAppointmentValidation = [
  body('appointmentDate')
    .notEmpty()
    .withMessage('Appointment date is required')
    .custom((value) => {
      // Allow both ISO8601 and yyyy-MM-dd formats
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      
      if (!dateRegex.test(value) && !isoRegex.test(value)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD or ISO8601 format');
      }
      
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      return true;
    }),
  body('appointmentTime')
    .notEmpty()
    .withMessage('Appointment time is required'),
  body('reasonForVisit')
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason for visit must be between 5-500 characters'),
  body('appointmentType')
    .optional()
    .isIn(['General Consultation', 'Follow-up', 'Emergency', 'Routine Check-up', 'Specialist Consultation'])
    .withMessage('Invalid appointment type')
];

const updateStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid appointment ID is required'),
  body('status')
    .isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status')
];

const cancelAppointmentValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid appointment ID is required'),
  body('cancelReason')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Cancel reason must be between 3-200 characters')
];

const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid appointment ID is required')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Protect all routes
router.use(authenticateToken);

// @route   POST /api/appointments
// @desc    Create appointment (Patient only)
// @access  Private (Patient)
router.post(
  '/',
  // Temporarily comment out validation to debug
  // createAppointmentValidation,
  // handleValidationErrors,
  createAppointment
);

// @route   GET /api/appointments/stats
// @desc    Get appointment statistics (Doctor only)
// @access  Private (Doctor)
router.get(
  '/stats',
  requireDoctor,
  getAppointmentStats
);

// @route   GET /api/appointments/doctor
// @desc    Get all appointments for doctor
// @access  Private (Doctor)
router.get(
  '/doctor',
  requireDoctor,
  paginationValidation,
  handleValidationErrors,
  getDoctorAppointments
);

// @route   GET /api/appointments/patient
// @desc    Get all appointments for patient
// @access  Private (Patient)
router.get(
  '/patient',
  paginationValidation,
  handleValidationErrors,
  getPatientAppointments
);

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private (Patient or Doctor)
router.get(
  '/:id',
  mongoIdValidation,
  handleValidationErrors,
  getAppointment
);

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status (Doctor only)
// @access  Private (Doctor)
router.put(
  '/:id/status',
  requireDoctor,
  updateStatusValidation,
  handleValidationErrors,
  updateAppointmentStatus
);

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment (Patient only)
// @access  Private (Patient)
router.put(
  '/:id/cancel',
  cancelAppointmentValidation,
  handleValidationErrors,
  cancelAppointment
);

module.exports = router;