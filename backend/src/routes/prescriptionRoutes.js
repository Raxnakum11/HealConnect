const express = require('express');
const {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
  completePrescription,
  getPatientPrescriptions,
  getPrescriptionStats
} = require('../controllers/prescriptionController');
const { authenticateToken, requireDoctor } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const {
  createPrescriptionValidation,
  mongoIdValidation,
  paginationValidation
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/prescriptions/stats
// @desc    Get prescription statistics for doctor
// @access  Private (Doctor only)
router.get('/stats', requireDoctor, getPrescriptionStats);

// @route   GET /api/prescriptions/patient/:patientId
// @desc    Get patient's prescription history
// @access  Private
router.get(
  '/patient/:patientId',
  mongoIdValidation,
  handleValidationErrors,
  getPatientPrescriptions
);

// @route   GET /api/prescriptions
// @desc    Get all prescriptions for a doctor
// @access  Private (Doctor only)
router.get(
  '/',
  requireDoctor,
  paginationValidation,
  handleValidationErrors,
  getPrescriptions
);

// @route   GET /api/prescriptions/:id
// @desc    Get single prescription
// @access  Private
router.get(
  '/:id',
  mongoIdValidation,
  handleValidationErrors,
  getPrescription
);

// @route   POST /api/prescriptions
// @desc    Create new prescription
// @access  Private (Doctor only)
router.post(
  '/',
  requireDoctor,
  createPrescriptionValidation,
  handleValidationErrors,
  createPrescription
);

// @route   PUT /api/prescriptions/:id
// @desc    Update prescription
// @access  Private (Doctor only)
router.put(
  '/:id',
  requireDoctor,
  mongoIdValidation,
  handleValidationErrors,
  updatePrescription
);

// @route   DELETE /api/prescriptions/:id
// @desc    Delete prescription (soft delete)
// @access  Private (Doctor only)
router.delete(
  '/:id',
  requireDoctor,
  mongoIdValidation,
  handleValidationErrors,
  deletePrescription
);

// @route   PATCH /api/prescriptions/:id/complete
// @desc    Mark prescription as completed
// @access  Private (Doctor only)
router.patch(
  '/:id/complete',
  requireDoctor,
  mongoIdValidation,
  handleValidationErrors,
  completePrescription
);

module.exports = router;