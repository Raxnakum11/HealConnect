const express = require('express');
const {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  addVisit,
  getPatientStats,
  assignPatientToDoctor,
  updatePatientEmail,
  getPatientVisitHistory
} = require('../controllers/patientController');
const { authenticateToken, requireDoctor } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const {
  createPatientValidation,
  updatePatientValidation,
  addVisitValidation,
  mongoIdValidation,
  paginationValidation
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/patients/stats
// @desc    Get patient statistics for doctor
// @access  Private (Doctor only)
router.get('/stats', requireDoctor, getPatientStats);

// @route   GET /api/patients
// @desc    Get all patients for a doctor
// @access  Private (Doctor only)
router.get(
  '/',
  requireDoctor,
  paginationValidation,
  handleValidationErrors,
  getPatients
);

// @route   GET /api/patients/:id
// @desc    Get single patient
// @access  Private
router.get(
  '/:id',
  mongoIdValidation,
  handleValidationErrors,
  getPatient
);

// @route   GET /api/patients/:id/visit-history
// @desc    Get patient visit history
// @access  Private
router.get(
  '/:id/visit-history',
  mongoIdValidation,
  handleValidationErrors,
  getPatientVisitHistory
);

// @route   POST /api/patients
// @desc    Create new patient
// @access  Private (Doctor only)
router.post(
  '/',
  requireDoctor,
  createPatientValidation,
  handleValidationErrors,
  createPatient
);

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Private (Doctor only)
router.put(
  '/:id',
  requireDoctor,
  mongoIdValidation,
  updatePatientValidation,
  handleValidationErrors,
  updatePatient
);

// @route   DELETE /api/patients/:id
// @desc    Delete patient (soft delete)
// @access  Private (Doctor only)
router.delete(
  '/:id',
  requireDoctor,
  mongoIdValidation,
  handleValidationErrors,
  deletePatient
);

// @route   POST /api/patients/:id/visits
// @desc    Add new visit for patient
// @access  Private (Doctor only)
router.post(
  '/:id/visits',
  requireDoctor,
  mongoIdValidation,
  addVisitValidation,
  handleValidationErrors,
  addVisit
);

// @route   PUT /api/patients/:id/assign
// @desc    Assign unassigned patient to doctor
// @access  Private (Doctor only)
router.put(
  '/:id/assign',
  requireDoctor,
  mongoIdValidation,
  handleValidationErrors,
  assignPatientToDoctor
);

// @route   PUT /api/patients/:id/email
// @desc    Update patient email address
// @access  Private (Doctor only)
router.put(
  '/:id/email',
  requireDoctor,
  mongoIdValidation,
  handleValidationErrors,
  updatePatientEmail
);

module.exports = router;