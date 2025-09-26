const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// Helper function to get demo doctor ID
const getDemoDoctorId = async () => {
  const demoDoctor = await User.findOne({ mobile: '9999999999', role: 'doctor' });
  return demoDoctor ? demoDoctor._id : null;
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const createAppointment = asyncHandler(async (req, res) => {
  const {
    doctorId,
    appointmentDate,
    appointmentTime,
    appointmentType,
    reasonForVisit,
    notes
  } = req.body;

  console.log('📝 Creating appointment - Request body:', JSON.stringify(req.body, null, 2));
  console.log('📝 User info:', { userId: req.user.id, userRole: req.user.role });

  // Validate required fields manually since validation middleware might be failing
  if (!appointmentDate) {
    return res.status(400).json({
      success: false,
      message: 'Appointment date is required'
    });
  }

  if (!appointmentTime) {
    return res.status(400).json({
      success: false,
      message: 'Appointment time is required'
    });
  }

  if (!reasonForVisit || reasonForVisit.length < 5) {
    return res.status(400).json({
      success: false,
      message: 'Reason for visit must be at least 5 characters long'
    });
  }

  // Get or create patient record for the logged-in user
  let patient = await Patient.findOne({ userId: req.user.id });
  
  if (!patient) {
    // If patient record doesn't exist, create one
    const user = await User.findById(req.user.id);
    
    // Get demo doctor ID
    const demoDoctorId = await getDemoDoctorId();
    
    // Generate unique patient ID
    let patientId;
    let isUnique = false;
    let counter = 1;
    
    const lastPatient = await Patient.findOne(
      {},
      { patientId: 1 }
    ).sort({ patientId: -1 });
    
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

    patient = await Patient.create(patientData);
    console.log(`✅ Patient record created for appointment: ${patient.patientId}`);
  }

  // Use the demo doctor ID for all appointments if no specific doctorId provided
  let finalDoctorId = doctorId;
  if (!finalDoctorId) {
    finalDoctorId = await getDemoDoctorId();
  }

  if (!finalDoctorId) {
    return res.status(400).json({
      success: false,
      message: 'No doctor available for appointment'
    });
  }

  // Check for existing appointment at the same time
  const existingAppointment = await Appointment.findOne({
    doctorId: finalDoctorId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime: appointmentTime,
    status: { $in: ['scheduled', 'confirmed'] }
  });

  if (existingAppointment) {
    return res.status(400).json({
      success: false,
      message: 'This time slot is already booked. Please select another time.'
    });
  }

  // Create the appointment
  const appointmentData = {
    patientId: patient._id,
    doctorId: finalDoctorId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    appointmentType: appointmentType || 'General Consultation',
    reasonForVisit,
    notes,
    status: 'scheduled',
    createdBy: req.user.id
  };

  const appointment = await Appointment.create(appointmentData);

  // Populate the appointment with patient and doctor details
  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patientId', 'patientId name email mobile age gender')
    .populate('doctorId', 'name email specialization')
    .populate('createdBy', 'name email');

  console.log(`✅ Appointment created:`, {
    appointmentId: appointment.appointmentId,
    patientId: patient.patientId,
    doctorId: finalDoctorId,
    date: appointmentDate,
    time: appointmentTime
  });

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: {
      appointment: populatedAppointment
    }
  });
});

// @desc    Get all appointments for doctor
// @route   GET /api/appointments/doctor
// @access  Private (Doctor)
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;
  const { status, date, limit = 50, page = 1 } = req.query;
  
  console.log(`🔍 Fetching appointments for doctor: ${doctorId}`, { status, date, limit, page });
  
  // Build query
  let query = { doctorId: doctorId };
  
  // Filter by status if provided
  if (status && status !== 'all') {
    query.status = status;
  } else {
    // By default, exclude cancelled appointments
    query.status = { $ne: 'cancelled' };
  }
  
  // Filter by date if provided
  if (date) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
  }

  // Get appointments with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const appointments = await Appointment.find(query)
    .populate('patientId', 'patientId name email mobile age gender address medicalHistory')
    .populate('doctorId', 'name email specialization')
    .populate('createdBy', 'name email')
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await Appointment.countDocuments(query);

  console.log(`📋 Found ${appointments.length} appointments for doctor (Total: ${total})`);

  res.status(200).json({
    success: true,
    data: {
      appointments,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get all appointments for patient
// @route   GET /api/appointments/patient
// @access  Private (Patient)
const getPatientAppointments = asyncHandler(async (req, res) => {
  // Get patient record for the logged-in user
  const patient = await Patient.findOne({ userId: req.user.id });
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient record not found'
    });
  }

  const { status, limit = 20, page = 1 } = req.query;
  
  // Build query
  let query = { patientId: patient._id };
  
  if (status && status !== 'all') {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const appointments = await Appointment.find(query)
    .populate('patientId', 'patientId name email mobile age gender')
    .populate('doctorId', 'name email specialization')
    .populate('createdBy', 'name email')
    .sort({ appointmentDate: -1, appointmentTime: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      appointments,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    }
  });
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patientId', 'patientId name email mobile age gender address medicalHistory')
    .populate('doctorId', 'name email specialization')
    .populate('createdBy', 'name email');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check if user has access to this appointment
  const patient = await Patient.findOne({ userId: req.user.id });
  const isPatient = patient && appointment.patientId._id.toString() === patient._id.toString();
  const isDoctor = appointment.doctorId._id.toString() === req.user.id;

  if (!isPatient && !isDoctor) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this appointment'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      appointment
    }
  });
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, notes, cancelReason } = req.body;
  const appointmentId = req.params.id;

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check if the doctor is authorized to update this appointment
  if (appointment.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this appointment'
    });
  }

  // Update appointment
  appointment.status = status;
  if (notes) appointment.notes = notes;
  if (cancelReason) appointment.cancelReason = cancelReason;
  
  await appointment.save();

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patientId', 'patientId name email mobile age gender')
    .populate('doctorId', 'name email specialization')
    .populate('createdBy', 'name email');

  console.log(`✅ Appointment ${appointmentId} status updated to: ${status}`);

  res.status(200).json({
    success: true,
    message: 'Appointment status updated successfully',
    data: {
      appointment: populatedAppointment
    }
  });
});

// @desc    Cancel appointment (Patient)
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Patient)
const cancelAppointment = asyncHandler(async (req, res) => {
  const { cancelReason } = req.body;
  const appointmentId = req.params.id;

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check if the patient is authorized to cancel this appointment
  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this appointment'
    });
  }

  // Update appointment
  appointment.status = 'cancelled';
  appointment.cancelReason = cancelReason || 'Cancelled by patient';
  
  await appointment.save();

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patientId', 'patientId name email mobile age gender')
    .populate('doctorId', 'name email specialization')
    .populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully',
    data: {
      appointment: populatedAppointment
    }
  });
});

// @desc    Get appointment statistics for doctor
// @route   GET /api/appointments/stats
// @access  Private (Doctor)
const getAppointmentStats = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;
  
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Get various statistics
  const [
    totalAppointments,
    todayAppointments,
    weekAppointments,
    monthAppointments,
    pendingAppointments,
    completedAppointments,
    cancelledAppointments
  ] = await Promise.all([
    Appointment.countDocuments({ doctorId }),
    Appointment.countDocuments({ 
      doctorId, 
      appointmentDate: { $gte: startOfToday, $lte: endOfToday } 
    }),
    Appointment.countDocuments({ 
      doctorId, 
      appointmentDate: { $gte: startOfWeek } 
    }),
    Appointment.countDocuments({ 
      doctorId, 
      appointmentDate: { $gte: startOfMonth } 
    }),
    Appointment.countDocuments({ doctorId, status: 'scheduled' }),
    Appointment.countDocuments({ doctorId, status: 'completed' }),
    Appointment.countDocuments({ doctorId, status: 'cancelled' })
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        total: totalAppointments,
        today: todayAppointments,
        thisWeek: weekAppointments,
        thisMonth: monthAppointments,
        pending: pendingAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments
      }
    }
  });
});

module.exports = {
  createAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentStats
};