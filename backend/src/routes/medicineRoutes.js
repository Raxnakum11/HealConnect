const express = require('express');
const {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  updateQuantity,
  getMedicineStats,
  getExpiringMedicines,
  importMedicines,
  upload
} = require('../controllers/medicineController');
const { authenticateToken, requireDoctor } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const {
  createMedicineValidation,
  updateMedicineValidation,
  updateQuantityValidation,
  mongoIdValidation,
  paginationValidation
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication and doctor role
router.use(authenticateToken, requireDoctor);

// @route   GET /api/medicines/stats
// @desc    Get medicine statistics for doctor
// @access  Private (Doctor only)
router.get('/stats', getMedicineStats);

// @route   GET /api/medicines/expiring
// @desc    Get expiring medicines
// @access  Private (Doctor only)
router.get('/expiring', getExpiringMedicines);

// @route   POST /api/medicines/import
// @desc    Import medicines from CSV/JSON file
// @access  Private (Doctor only)
router.post('/import', upload.single('file'), importMedicines);

// @route   GET /api/medicines
// @desc    Get all medicines for a doctor
// @access  Private (Doctor only)
router.get(
  '/',
  paginationValidation,
  handleValidationErrors,
  getMedicines
);

// @route   GET /api/medicines/:id
// @desc    Get single medicine
// @access  Private (Doctor only)
router.get(
  '/:id',
  mongoIdValidation,
  handleValidationErrors,
  getMedicine
);

// @route   POST /api/medicines
// @desc    Create new medicine
// @access  Private (Doctor only)
router.post(
  '/',
  createMedicineValidation,
  handleValidationErrors,
  createMedicine
);

// @route   PUT /api/medicines/:id
// @desc    Update medicine
// @access  Private (Doctor only)
router.put(
  '/:id',
  mongoIdValidation,
  updateMedicineValidation,
  handleValidationErrors,
  updateMedicine
);

// @route   DELETE /api/medicines/:id
// @desc    Delete medicine (soft delete)
// @access  Private (Doctor only)
router.delete(
  '/:id',
  mongoIdValidation,
  handleValidationErrors,
  deleteMedicine
);

// @route   PATCH /api/medicines/:id/quantity
// @desc    Update medicine quantity (for prescriptions)
// @access  Private (Doctor only)
router.patch(
  '/:id/quantity',
  mongoIdValidation,
  updateQuantityValidation,
  handleValidationErrors,
  updateQuantity
);

module.exports = router;