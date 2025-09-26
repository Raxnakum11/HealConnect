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

// Helper function to get demo doctor ID
const getDemoDoctorId = async () => {
  const demoDoctor = await User.findOne({ mobile: '9999999999', role: 'doctor' });
  return demoDoctor ? demoDoctor._id : null;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    mobile,
    password,
    role,
    specialization
  } = req.body;

  // Check if user already exists
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

  // Create user
  const userData = {
    name,
    email,
    mobile,
    password,
    role
  };

  // Add doctor-specific fields
  if (role === 'doctor') {
    userData.specialization = specialization;
  }

  const user = await User.create(userData);

  // If user is a patient, also create a Patient record
  if (role === 'patient') {
    // Get demo doctor ID for assignment
    const demoDoctorId = await getDemoDoctorId();
    
    // Generate unique patient ID
    let patientId;
    let isUnique = false;
    let counter = 1;
    
    // Get the highest existing patient number globally
    const lastPatient = await Patient.findOne(
      {},
      { patientId: 1 }
    ).sort({ patientId: -1 });
    
    if (lastPatient && lastPatient.patientId) {
      // Extract number from patientId (e.g., "PAT0006" -> 6)
      const lastNumber = parseInt(lastPatient.patientId.replace('PAT', ''));
      counter = lastNumber + 1;
    }
    
    // Ensure uniqueness
    while (!isUnique) {
      patientId = `PAT${String(counter).padStart(4, '0')}`;
      const existingWithId = await Patient.findOne({ patientId });
      
      if (!existingWithId) {
        isUnique = true;
      } else {
        counter++;
      }
    }
    
    const patientData = {
      patientId,
      name,
      email,
      mobile,
      age: 25, // Default age - user can update later
      gender: 'Other', // Default gender - user can update later
      address: 'Not provided', // Default address - user can update later
      medicalHistory: '',
      type: 'clinic', // Self-registered patients are clinic type
      userId: user._id, // Link to user record
      doctorId: demoDoctorId, // Assign to demo doctor for demo purposes
      isActive: true
    };

    try {
      const patientRecord = await Patient.create(patientData);
      console.log(`✅ Patient record created: ${patientRecord.patientId} for ${user.email} assigned to demo doctor`);
    } catch (patientError) {
      console.warn(`⚠️  Failed to create patient record for ${user.email}:`, patientError.message);
      // Continue with user creation even if patient creation fails
    }
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        specialization: user.specialization
      },
      token
    }
  });
});

// @desc    Login user with email/password OR mobile/name (backward compatibility)
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { mobile, name, role, email, password } = req.body;
  
  console.log('Login request received:', { mobile, name, role, email: email ? '***' : undefined });

  let user = null;

  // Method 1: Email and Password login (preferred)
  if (email && password) {
    user = await User.findOne({ email: email.toLowerCase() });
    
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
    
  } else if (mobile) {
    // Method 2: Mobile login (with optional name for backward compatibility)
    user = await User.findOne({ mobile: mobile });

    if (!user) {
      // Create new user if doesn't exist (auto-registration)
      const userData = {
        name: name || `User${mobile}`, // Use provided name or generate default
        mobile: mobile,
        role: role || 'patient',
        email: `user${mobile}@healconnect.com`, // Generate dummy email
        password: 'dummy123' // Dummy password
      };

      // Add doctor-specific fields
      if (role === 'doctor') {
        userData.specialization = 'homeopathy';
      }

      user = await User.create(userData);

      // Create patient record for new users with patient role
      if (user.role === 'patient') {
        const demoDoctorId = await getDemoDoctorId();
        
        // Generate unique patient ID
        let patientId;
        let isUnique = false;
        let counter = 1;
        
        const lastPatient = await Patient.findOne({}, { patientId: 1 }).sort({ patientId: -1 });
        
        if (lastPatient && lastPatient.patientId) {
          const lastNumber = parseInt(lastPatient.patientId.replace('PAT', ''));
          counter = lastNumber + 1;
        }
        
        while (!isUnique) {
          patientId = `PAT${String(counter).padStart(4, '0')}`;
          const existingWithId = await Patient.findOne({ patientId });
          
          if (!existingWithId) {
            isUnique = true;
          } else {
            counter++;
          }
        }
        
        const patientData = {
          patientId,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          age: 25,
          gender: 'Other',
          address: 'Not provided',
          medicalHistory: '',
          type: 'clinic',
          userId: user._id,
          doctorId: demoDoctorId, // Assign to demo doctor
          isActive: true
        };

        try {
          await Patient.create(patientData);
          console.log(`✅ Patient record created for auto-registered user: ${user.email}`);
        } catch (patientError) {
          console.warn(`⚠️  Failed to create patient record:`, patientError.message);
        }
      }
    } else {
      // Update name if provided and different
      if (name && name !== user.name) {
        user.name = name;
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }
  } else {
    return res.status(400).json({
      success: false,
      message: 'Please provide either email/password or mobile number'
    });
  }

  // Special handling for demo doctor login - assign unassigned patients
  if (user.role === 'doctor' && user.mobile === '9999999999') {
    try {
      // Assign all unassigned patients to this demo doctor
      const updateResult = await Patient.updateMany(
        { $or: [{ doctorId: null }, { doctorId: { $exists: false } }] },
        { doctorId: user._id }
      );
      
      if (updateResult.modifiedCount > 0) {
        console.log(`✅ Assigned ${updateResult.modifiedCount} unassigned patients to demo doctor`);
      }
      
      // Also update any existing patients that might belong to this doctor
      await Patient.updateMany(
        { mobile: { $in: ['9876543210', user.mobile] } }, // Common test numbers
        { doctorId: user._id }
      );
      
    } catch (error) {
      console.warn('⚠️  Failed to assign patients to demo doctor:', error.message);
    }
  }

  // Generate token
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
        role: user.role,
        specialization: user.specialization
      },
      token
    }
  });
});

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
        specialization: user.specialization,
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
  const allowedFields = ['name', 'mobile', 'specialization'];

  // Only update allowed fields that are provided
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  // Check if mobile number is being changed and not already taken
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
    {
      new: true,
      runValidators: true
    }
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
        role: user.role,
        specialization: user.specialization
      }
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isCurrentPasswordMatch = await user.matchPassword(currentPassword);

  if (!isCurrentPasswordMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Logout user (just a confirmation, actual logout handled by frontend)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
};