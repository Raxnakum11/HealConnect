const express = require('express');
const {
  getCamps,
  getCamp,
  createCamp,
  updateCamp,
  deleteCamp,
  completeCamp,
  addMedicineUsage,
  getUpcomingCamps,
  getCampStats
} = require('../controllers/campController');
const { authenticateToken, requireDoctor } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const {
  createCampValidation,
  updateCampValidation,
  addMedicineUsageValidation,
  mongoIdValidation,
  paginationValidation
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication and doctor role
router.use(authenticateToken, requireDoctor);

// @route   GET /api/camps/stats
// @desc    Get camp statistics for doctor
// @access  Private (Doctor only)
router.get('/stats', getCampStats);

// @route   GET /api/camps/upcoming
// @desc    Get upcoming camps
// @access  Private (Doctor only)
router.get('/upcoming', getUpcomingCamps);

// @route   GET /api/camps
// @desc    Get all camps for a doctor
// @access  Private (Doctor only)
router.get(
  '/',
  paginationValidation,
  handleValidationErrors,
  getCamps
);

// @route   GET /api/camps/:id
// @desc    Get single camp
// @access  Private (Doctor only)
router.get(
  '/:id',
  mongoIdValidation,
  handleValidationErrors,
  getCamp
);

// @route   POST /api/camps
// @desc    Create new camp
// @access  Private (Doctor only)
router.post(
  '/',
  createCampValidation,
  handleValidationErrors,
  createCamp
);

// @route   PUT /api/camps/:id
// @desc    Update camp
// @access  Private (Doctor only)
router.put(
  '/:id',
  mongoIdValidation,
  updateCampValidation,
  handleValidationErrors,
  updateCamp
);

// @route   DELETE /api/camps/:id
// @desc    Delete camp (soft delete)
// @access  Private (Doctor only)
router.delete(
  '/:id',
  mongoIdValidation,
  handleValidationErrors,
  deleteCamp
);

// @route   PATCH /api/camps/:id/complete
// @desc    Mark camp as completed
// @access  Private (Doctor only)
router.patch(
  '/:id/complete',
  mongoIdValidation,
  handleValidationErrors,
  completeCamp
);

// @route   POST /api/camps/:id/medicines
// @desc    Add medicine usage to camp
// @access  Private (Doctor only)
router.post(
  '/:id/medicines',
  mongoIdValidation,
  addMedicineUsageValidation,
  handleValidationErrors,
  addMedicineUsage
);

module.exports = router;