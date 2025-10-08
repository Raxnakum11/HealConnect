const { body, param, query } = require('express-validator');

// Auth validation
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('mobile')
    .matches(/^\d{10,12}$/)
    .withMessage('Please provide a valid mobile number (10-12 digits)'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .isIn(['doctor', 'patient'])
    .withMessage('Role must be either doctor or patient'),
  
  body('specialization')
    .if(body('role').equals('doctor'))
    .isIn(['homeopathy', 'allopathy'])
    .withMessage('Specialization must be either homeopathy or allopathy for doctors')
];

const loginValidation = [
  // Support both email/password and mobile/name authentication
  body()
    .custom((value, { req }) => {
      const { email, password, mobile, name } = req.body;
      
      // Method 1: Email and Password
      if (email && password) {
        return true; // Valid email/password login attempt
      }
      
      // Method 2: Mobile and Name (backward compatibility)
      if (mobile && name) {
        return true; // Valid mobile/name login attempt
      }
      
      // Method 3: Mobile only (will auto-register with default name)
      if (mobile && !name) {
        return true; // Allow mobile-only login for auto-registration
      }
      
      // If neither proper combination is provided
      if (!email && !password && !mobile && !name) {
        throw new Error('Please provide either (email + password) or mobile number for login');
      }
      
      // If email provided without password or vice versa
      if ((email && !password) || (!email && password)) {
        throw new Error('Both email and password are required for email login');
      }
      
      return true;
    }),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('mobile')
    .optional()
    .matches(/^\d{10,12}$/)
    .withMessage('Please provide a valid mobile number (10-12 digits)'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters if provided'),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .optional()
    .isIn(['doctor', 'patient'])
    .withMessage('Role must be either doctor or patient')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Patient validation
const createPatientValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('age')
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('mobile')
    .matches(/^\d{10,12}$/)
    .withMessage('Please provide a valid mobile number (10-12 digits)'),
  
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  
  body('type')
    .isIn(['clinic', 'camp'])
    .withMessage('Type must be clinic or camp'),
  
  body('campId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid camp ID'),
  
  body('medicalHistory')
    .optional()
    .trim()
];

const updatePatientValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('mobile')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Please provide a valid 10-digit mobile number'),
  
  body('address')
    .optional()
    .trim()
];

const addVisitValidation = [
  body('symptoms')
    .notEmpty()
    .withMessage('Symptoms are required'),
  
  body('clinicType')
    .optional()
    .isIn(['clinic', 'camp'])
    .withMessage('Clinic type must be clinic or camp')
];

// Medicine validation
const createMedicineValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Medicine name is required')
    .isLength({ max: 100 })
    .withMessage('Medicine name cannot exceed 100 characters'),
  
  body('batch')
    .trim()
    .notEmpty()
    .withMessage('Batch number is required'),
  
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a positive integer'),
  
  body('size')
    .trim()
    .notEmpty()
    .withMessage('Medicine size is required'),
  
  body('unit')
    .isIn(['mg', 'g', 'ml', 'tablets', 'capsules', 'drops', 'syrup'])
    .withMessage('Invalid unit'),
  
  body('expiryDate')
    .isISO8601()
    .withMessage('Please provide a valid expiry date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  
  body('priority')
    .optional()
    .isIn(['high', 'medium', 'low'])
    .withMessage('Priority must be high, medium, or low'),
  
  body('type')
    .isIn(['clinic', 'camp', 'others'])
    .withMessage('Type must be clinic, camp, or others'),
  
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number')
];

const updateMedicineValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Medicine name cannot exceed 100 characters'),
  
  body('batch')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Batch number cannot be empty'),
  
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a positive integer'),
  
  body('size')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Medicine size cannot be empty'),
  
  body('unit')
    .optional()
    .isIn(['mg', 'g', 'ml', 'tablets', 'capsules', 'drops', 'syrup'])
    .withMessage('Invalid unit'),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid expiry date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  
  body('priority')
    .optional()
    .isIn(['high', 'medium', 'low'])
    .withMessage('Priority must be high, medium, or low'),
  
  body('type')
    .optional()
    .isIn(['clinic', 'camp', 'others'])
    .withMessage('Type must be clinic, camp, or others'),
  
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number')
];

const updateQuantityValidation = [
  body('quantityUsed')
    .isInt({ min: 1 })
    .withMessage('Quantity used must be a positive integer'),
  
  body('operation')
    .isIn(['subtract', 'add'])
    .withMessage('Operation must be subtract or add')
];

// Camp validation
const createCampValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Camp name is required')
    .isLength({ max: 200 })
    .withMessage('Camp name cannot exceed 200 characters'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 300 })
    .withMessage('Location cannot exceed 300 characters'),
  
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('time')
    .trim()
    .notEmpty()
    .withMessage('Time is required'),
  
  body('type')
    .optional()
    .isIn(['camp', 'clinic'])
    .withMessage('Type must be camp or clinic'),
  
  body('organizer')
    .trim()
    .notEmpty()
    .withMessage('Organizer name is required')
    .isLength({ max: 100 })
    .withMessage('Organizer name cannot exceed 100 characters'),
  
  body('organizerContact')
    .matches(/^\d{10}$/)
    .withMessage('Please provide a valid 10-digit contact number'),
  
  body('expectedPatients')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Expected patients must be a positive integer')
];

const updateCampValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Camp name cannot exceed 200 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Location cannot exceed 300 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('time')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Time cannot be empty'),
  
  body('status')
    .optional()
    .isIn(['scheduled', 'ongoing', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('type')
    .optional()
    .isIn(['camp', 'clinic'])
    .withMessage('Type must be camp or clinic'),
  
  body('organizer')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Organizer name cannot exceed 100 characters'),
  
  body('organizerContact')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Please provide a valid 10-digit contact number'),
  
  body('expectedPatients')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Expected patients must be a positive integer'),
  
  body('actualPatients')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Actual patients must be a positive integer')
];

const addMedicineUsageValidation = [
  body('medicineId')
    .isMongoId()
    .withMessage('Invalid medicine ID'),
  
  body('quantityUsed')
    .isInt({ min: 1 })
    .withMessage('Quantity used must be a positive integer')
];

// Prescription validation
const createPrescriptionValidation = [
  body('patientId')
    .isMongoId()
    .withMessage('Invalid patient ID'),
  
  body('campId')
    .optional()
    .custom((value) => {
      // Allow null, undefined, or valid MongoDB ObjectId
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // Check if it's a valid MongoDB ObjectId
      if (typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/)) {
        return true;
      }
      throw new Error('Invalid camp ID');
    }),
  
  body('visitId')
    .optional()
    .custom((value) => {
      // Allow auto-generated visit IDs or MongoDB ObjectIds
      if (typeof value === 'string' && value.length > 0) {
        return true;
      }
      throw new Error('Visit ID must be a valid string');
    }),
  
  body('medicines')
    .isArray({ min: 1 })
    .withMessage('At least one medicine is required'),
  
  body('medicines.*.medicineId')
    .isMongoId()
    .withMessage('Invalid medicine ID'),
  
  body('medicines.*.dosage')
    .trim()
    .notEmpty()
    .withMessage('Dosage is required'),
  
  body('medicines.*.frequency')
    .isIn(['Once daily', 'Twice daily', 'Thrice daily', 'Four times daily', 'As needed', 'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'Custom'])
    .withMessage('Invalid frequency'),
  
  body('medicines.*.duration')
    .trim()
    .notEmpty()
    .withMessage('Duration is required'),
  
  body('medicines.*.timing')
    .optional()
    .isIn(['Before meals', 'After meals', 'With meals', 'Empty stomach', 'At bedtime', 'As directed'])
    .withMessage('Invalid timing'),
  
  body('medicines.*.quantityGiven')
    .isInt({ min: 1 })
    .withMessage('Quantity given must be a positive integer'),
  
  body('symptoms')
    .trim()
    .notEmpty()
    .withMessage('Symptoms are required'),
  
  body('diagnosis')
    .optional()
    .trim(),
  
  body('additionalNotes')
    .optional()
    .trim(),
  
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid follow-up date')
];

// Common validations
const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
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

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  createPatientValidation,
  updatePatientValidation,
  addVisitValidation,
  createMedicineValidation,
  updateMedicineValidation,
  updateQuantityValidation,
  createCampValidation,
  updateCampValidation,
  addMedicineUsageValidation,
  createPrescriptionValidation,
  mongoIdValidation,
  paginationValidation
};