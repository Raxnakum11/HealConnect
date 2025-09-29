const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Check if user is a doctor
const requireDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Doctor role required.'
    });
  }
};

// Check if user is a patient
const requirePatient = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Patient role required.'
    });
  }
};

// Check if user is admin (if you add admin role in future)
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
};

// Check if user can access specific patient data
const requirePatientAccess = async (req, res, next) => {
  try {
    const patientId = req.params.patientId || req.body.patientId;
    
    if (req.user.role === 'doctor') {
      // Doctors can access any patient
      next();
    } else if (req.user.role === 'patient') {
      // Patients can only access their own data
      if (req.user._id.toString() === patientId) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own data.'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Invalid role.'
      });
    }
  } catch (error) {
    console.error('Patient access middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

// Check if user can access specific doctor's data
const requireDoctorAccess = (req, res, next) => {
  try {
    const doctorId = req.params.doctorId || req.body.doctorId;
    
    if (req.user.role === 'doctor' && req.user._id.toString() === doctorId) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own data.'
      });
    }
  } catch (error) {
    console.error('Doctor access middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

module.exports = {
  authenticateToken,
  requireDoctor,
  requirePatient,
  requireAdmin,
  requirePatientAccess,
  requireDoctorAccess
};