const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all appointments for a doctor or patient
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;

    // Build filter based on user role
    let filter = {};
    
    if (req.user.role === 'doctor') {
      filter.doctorId = req.user.id;
    } else if (req.user.role === 'patient') {
      // Get patient information
      const patient = await Patient.findOne({ userId: req.user.id });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient profile not found'
        });
      }
      filter.patientId = patient._id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get appointments with populated data based on user role
    let populateFields = '';
    if (req.user.role === 'doctor') {
      populateFields = 'patientId';
    } else {
      populateFields = 'doctorId';
    }

    const appointments = await Appointment.find(filter)
      .populate(populateFields, 'name mobile email patientId specialization')
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments',
      error: error.message
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name mobile email patientId age gender address')
      .populate('doctorId', 'name email specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to view this appointment
    if (req.user.role === 'doctor' && appointment.doctorId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'patient' && appointment.patientId._id.toString() !== req.user.patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointment',
      error: error.message
    });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, type, reason } = req.body;

    // Validate required fields
    if (!doctorId || !date || !timeSlot || !type || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get patient information
    let patient;
    if (req.user.role === 'patient') {
      patient = await Patient.findOne({ userId: req.user.id });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient profile not found'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only patients can book appointments'
      });
    }

    // Check if appointment date is in the future (at least 24 hours ahead)
    const appointmentDate = new Date(date);
    const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    if (appointmentDate < minDate) {
      return res.status(400).json({
        success: false,
        message: 'Appointments must be booked at least 24 hours in advance'
      });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      },
      timeSlot,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      patientId: patient._id,
      patientName: patient.name,
      doctorId,
      date: appointmentDate,
      time: timeSlot,
      timeSlot,
      type,
      reason,
      status: 'pending'
    });

    await appointment.save();

    // Populate the response
    await appointment.populate('patientId', 'name mobile email patientId');
    await appointment.populate('doctorId', 'name email specialization');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message
    });
  }
};

// @desc    Update appointment status (approve/reject)
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor only)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if doctor owns this appointment
    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    appointment.status = status;
    if (notes) {
      appointment.notes = notes;
    }

    await appointment.save();

    // Update patient's next appointment if approved
    if (status === 'approved') {
      await Patient.findByIdAndUpdate(appointment.patientId, {
        nextAppointment: appointment.date
      });
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Patient only)
const cancelAppointment = async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Get patient information
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if appointment can be cancelled (at least 24 hours before)
    const appointmentTime = new Date(appointment.date);
    const minCancelTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (appointmentTime < minCancelTime) {
      return res.status(400).json({
        success: false,
        message: 'Appointments can only be cancelled at least 24 hours in advance'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelReason = cancelReason || 'Cancelled by patient';

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
};

// @desc    Get available time slots
// @route   GET /api/appointments/slots/:doctorId/:date
// @access  Private
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID'
      });
    }

    const availableSlots = await Appointment.getAvailableSlots(doctorId, date);

    res.status(200).json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots',
      error: error.message
    });
  }
};

// @desc    Get appointment statistics for doctor
// @route   GET /api/appointments/stats
// @access  Private (Doctor only)
const getAppointmentStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const stats = await Appointment.aggregate([
      { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const todayAppointments = await Appointment.countDocuments({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'approved'] }
    });

    const result = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0,
      today: todayAppointments
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAvailableSlots,
  getAppointmentStats
};