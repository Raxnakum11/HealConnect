const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { asyncHandler } = require('../middleware/errorHandler');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================================
// DOCTOR AUTH
// ============================================================

// @desc    Register doctor (only ONE doctor allowed)
// @route   POST /api/auth/doctor/register
// @access  Public
const doctorRegister = asyncHandler(async (req, res) => {
  const { name, email, mobile, password } = req.body;

  // Check if a doctor already exists
  const existingDoctor = await User.findOne({ role: 'doctor' });
  if (existingDoctor) {
    return res.status(400).json({
      success: false,
      message: 'A doctor account already exists. Only one doctor is allowed.'
    });
  }

  // Check if email or mobile already taken
  const existingUser = await User.findOne({
    $or: [{ email }, { mobile }]
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }
    if (existingUser.mobile === mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is already registered'
      });
    }
  }

  // Create doctor user
  const user = await User.create({
    name,
    email,
    mobile,
    password,
    role: 'doctor'
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Doctor registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      },
      token
    }
  });
});

// @desc    Login doctor with email/password
// @route   POST /api/auth/doctor/login
// @access  Public
const doctorLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find doctor by email
  const user = await User.findOne({ email: email.toLowerCase(), role: 'doctor' });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      },
      token
    }
  });
});

// ============================================================
// PATIENT AUTH (OTP-based, restricted to doctor-created cases)
// ============================================================

// @desc    Send OTP to patient mobile (only if doctor created their case)
// @route   POST /api/auth/patient/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  // Check if a doctor-created active Patient record exists for this mobile
  const patient = await Patient.findOne({
    mobile,
    isActive: true,
    doctorId: { $exists: true, $ne: null }
  }).sort({ updatedAt: -1, createdAt: -1 });

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'No patient record found. Only patients registered by the doctor can log in.'
    });
  }

  // Find or create a User record for this patient
  let user = await User.findOne({ mobile, role: 'patient' });

  if (!user) {
    // Auto-create user record for this patient
    user = await User.create({
      name: patient.name,
      mobile: patient.mobile,
      email: patient.email || undefined,
      role: 'patient'
    });
  }

  // Always ensure active doctor-created patient records with same mobile are linked to this user
  await Patient.updateMany(
    {
      mobile,
      isActive: true,
      doctorId: { $exists: true, $ne: null },
      $or: [{ userId: { $exists: false } }, { userId: null }, { userId: { $ne: user._id } }]
    },
    { $set: { userId: user._id } }
  );

  // Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Store OTP in user record
  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // Log OTP to console (in production, send via SMS)
  console.log(`\n📱 OTP for ${mobile}: ${otp} (expires in 5 minutes)\n`);

  const responseData = {
    mobile,
    otpExpiry: otpExpiry.toISOString()
  };

  // Development convenience: return OTP in API response when not in production
  if (process.env.NODE_ENV !== 'production') {
    responseData.devOtp = otp;
  }

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully to your mobile number',
    data: responseData
  });
});

// @desc    Verify OTP and login patient
// @route   POST /api/auth/patient/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;

  // Find user by mobile
  const user = await User.findOne({ mobile, role: 'patient' });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found. Please request a new OTP.'
    });
  }

  // Check if OTP exists and hasn't expired
  if (!user.otp || !user.otpExpiry) {
    return res.status(400).json({
      success: false,
      message: 'No OTP found. Please request a new OTP.'
    });
  }

  if (new Date() > user.otpExpiry) {
    // Clear expired OTP
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(400).json({
      success: false,
      message: 'OTP has expired. Please request a new OTP.'
    });
  }

  if (user.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP. Please try again.'
    });
  }

  // Ensure patient records are linked for profile access after successful OTP verification
  await Patient.updateMany(
    {
      mobile,
      isActive: true,
      doctorId: { $exists: true, $ne: null },
      $or: [{ userId: { $exists: false } }, { userId: null }, { userId: { $ne: user._id } }]
    },
    { $set: { userId: user._id } }
  );

  // OTP is valid — clear it and login
  user.otp = null;
  user.otpExpiry = null;
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      },
      token
    }
  });
});

// ============================================================
// SHARED ENDPOINTS (both roles)
// ============================================================

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {};
  const allowedFields = ['name', 'mobile'];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  if (fieldsToUpdate.mobile) {
    const existingUser = await User.findOne({
      mobile: fieldsToUpdate.mobile,
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is already registered'
      });
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    }
  });
});

// @desc    Change password (doctor only)
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);

  if (user.role !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Password change is only available for doctor accounts'
    });
  }

  const isCurrentPasswordMatch = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = {
  doctorRegister,
  doctorLogin,
  sendOtp,
  verifyOtp,
  getMe,
  updateProfile,
  changePassword,
  logout
};