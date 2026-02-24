const express = require('express');
const {
  doctorRegister,
  doctorLogin,
  sendOtp,
  verifyOtp,
  getMe,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const {
  doctorRegisterValidation,
  doctorLoginValidation,
  sendOtpValidation,
  verifyOtpValidation,
  changePasswordValidation
} = require('../middleware/validation');

const router = express.Router();

// ============================================================
// DOCTOR AUTH ROUTES
// ============================================================

// @route   POST /api/auth/doctor/register
// @desc    Register doctor (only one allowed)
// @access  Public
router.post(
  '/doctor/register',
  doctorRegisterValidation,
  handleValidationErrors,
  doctorRegister
);

// @route   POST /api/auth/doctor/login
// @desc    Login doctor with email/password
// @access  Public
router.post(
  '/doctor/login',
  doctorLoginValidation,
  handleValidationErrors,
  doctorLogin
);

// ============================================================
// PATIENT AUTH ROUTES (OTP-based)
// ============================================================

// @route   POST /api/auth/patient/send-otp
// @desc    Send OTP to patient mobile (only doctor-created patients)
// @access  Public
router.post(
  '/patient/send-otp',
  sendOtpValidation,
  handleValidationErrors,
  sendOtp
);

// @route   POST /api/auth/patient/verify-otp
// @desc    Verify OTP and login patient
// @access  Public
router.post(
  '/patient/verify-otp',
  verifyOtpValidation,
  handleValidationErrors,
  verifyOtp
);

// ============================================================
// SHARED ROUTES (both roles)
// ============================================================

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change password (doctor only)
// @access  Private
router.put(
  '/change-password',
  authenticateToken,
  changePasswordValidation,
  handleValidationErrors,
  changePassword
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, logout);

module.exports = router;