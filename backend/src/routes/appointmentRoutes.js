const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  deleteAppointment,
  getAvailableSlots,
  getAppointmentStats
} = require('../controllers/appointmentController');
const { authenticateToken, requireDoctor, requirePatient } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { body, param, query } = require('express-validator');

const router = express.Router();

// Validation middleware
const createAppointmentValidation = [
  body('doctorId')
    .optional()
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isDate()
    .withMessage('Invalid date format'),
  body('timeSlot')
    .notEmpty()
    .withMessage('Time slot is required')
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
    .withMessage('Invalid time format (e.g., 02:00 PM)'),
  body('type')
    .notEmpty()
    .withMessage('Appointment type is required')
    .isIn([
      'consultation', 
      'followup', 
      'checkup', 
      'homeopathy_consultation', 
      'constitutional_treatment',
      'specialist_consultation',
      'diagnostic_review',
      'emergency'
    ])
    .withMessage('Invalid appointment type'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be between 3-500 characters')
];

const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['approved', 'rejected', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid appointment ID')
];

const slotsValidation = [
  param('doctorId')
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  param('date')
    .isISO8601()
    .withMessage('Invalid date format')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1-100'),
  query('status')
    .optional()
    .isIn(['all', 'pending', 'approved', 'rejected', 'completed', 'cancelled'])
    .withMessage('Invalid status filter'),
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/appointments/stats
// @desc    Get appointment statistics for doctor
// @access  Private (Doctor only)
router.get('/stats', requireDoctor, getAppointmentStats);

// @route   GET /api/appointments/slots/:doctorId/:date
// @desc    Get available time slots for a doctor on a specific date
// @access  Private
router.get(
  '/slots/:doctorId/:date',
  slotsValidation,
  handleValidationErrors,
  getAvailableSlots
);

// @route   GET /api/appointments
// @desc    Get all appointments (doctor gets their appointments, patient gets their appointments)
// @access  Private
router.get(
  '/',
  paginationValidation,
  handleValidationErrors,
  getAppointments
);

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get(
  '/:id',
  mongoIdValidation,
  handleValidationErrors,
  getAppointment
);

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private (Patient only)
router.post(
  '/',
  requirePatient,
  createAppointmentValidation,
  handleValidationErrors,
  createAppointment
);

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status (approve/reject/complete)
// @access  Private (Doctor only)
router.put(
  '/:id/status',
  requireDoctor,
  mongoIdValidation,
  updateStatusValidation,
  handleValidationErrors,
  updateAppointmentStatus
);

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment
// @access  Private (Patient only)
router.put(
  '/:id/cancel',
  requirePatient,
  mongoIdValidation,
  handleValidationErrors,
  cancelAppointment
);

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private (Doctor only)
router.delete(
  '/:id',
  requireDoctor,
  mongoIdValidation,
  handleValidationErrors,
  deleteAppointment
);

module.exports = router;