const Camp = require('../models/Camp');
const Patient = require('../models/Patient');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get camps (doctor sees own camps, patient sees active camps)
// @route   GET /api/camps
// @access  Private (Doctor/Patient)
const getCamps = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const search = req.query.search || '';
  const status = req.query.status;
  const type = req.query.type;
  const upcoming = req.query.upcoming; // 'true' to get upcoming camps only
  
  // Build query
  const query = { isActive: true };

  if (req.user.role === 'doctor') {
    query.doctorId = req.user.id;
  }
  
  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { organizer: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Filter by type
  if (type) {
    query.type = type;
  }
  
  // Filter by upcoming camps
  if (upcoming === 'true') {
    const today = new Date();
    query.date = { $gte: today };
    query.status = { $in: ['scheduled', 'ongoing'] };
  }
  
  const camps = await Camp.find(query)
    .populate('medicinesUsed.medicineId', 'name size unit')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Camp.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      camps,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// @desc    Get single camp
// @route   GET /api/camps/:id
// @access  Private (Doctor/Patient)
const getCamp = asyncHandler(async (req, res) => {
  const camp = await Camp.findById(req.params.id)
    .populate('doctorId', 'firstName lastName specialization')
    .populate('medicinesUsed.medicineId', 'name size unit batch');
  
  if (!camp) {
    return res.status(404).json({
      success: false,
      message: 'Camp not found'
    });
  }
  
  // Doctors can only access their own camps. Patients can view active camps.
  if (req.user.role === 'doctor' && camp.doctorId._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  if (req.user.role === 'patient' && !camp.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Camp not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: { camp }
  });
});

// @desc    Create new camp
// @route   POST /api/camps
// @access  Private (Doctor only)
const createCamp = asyncHandler(async (req, res) => {
  const {
    name,
    location,
    date,
    time,
    type,
    organizer,
    organizerContact,
    expectedPatients,
    description,
    notes
  } = req.body;
  
  const camp = await Camp.create({
    name,
    location,
    date,
    time,
    type,
    organizer,
    organizerContact,
    expectedPatients,
    description,
    notes,
    doctorId: req.user.id
  });
  
  res.status(201).json({
    success: true,
    message: 'Camp created successfully',
    data: { camp }
  });
});

// @desc    Update camp
// @route   PUT /api/camps/:id
// @access  Private (Doctor only)
const updateCamp = asyncHandler(async (req, res) => {
  let camp = await Camp.findById(req.params.id);
  
  if (!camp) {
    return res.status(404).json({
      success: false,
      message: 'Camp not found'
    });
  }
  
  // Check if user owns this camp
  if (camp.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  // Fields that can be updated
  const allowedFields = [
    'name', 'location', 'date', 'time', 'status', 'type',
    'organizer', 'organizerContact', 'expectedPatients', 'actualPatients',
    'description', 'notes'
  ];
  
  const fieldsToUpdate = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });
  
  camp = await Camp.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).populate('medicinesUsed.medicineId', 'name size unit');
  
  res.status(200).json({
    success: true,
    message: 'Camp updated successfully',
    data: { camp }
  });
});

// @desc    Delete camp (soft delete)
// @route   DELETE /api/camps/:id
// @access  Private (Doctor only)
const deleteCamp = asyncHandler(async (req, res) => {
  const camp = await Camp.findById(req.params.id);
  
  if (!camp) {
    return res.status(404).json({
      success: false,
      message: 'Camp not found'
    });
  }
  
  // Check if user owns this camp
  if (camp.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  // Only allow deletion if camp is not completed
  if (camp.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete completed camp'
    });
  }
  
  // Soft delete
  camp.isActive = false;
  await camp.save();
  
  res.status(200).json({
    success: true,
    message: 'Camp deleted successfully'
  });
});

// @desc    Mark camp as completed
// @route   PATCH /api/camps/:id/complete
// @access  Private (Doctor only)
const completeCamp = asyncHandler(async (req, res) => {
  const { actualPatients } = req.body;
  
  const camp = await Camp.findById(req.params.id);
  
  if (!camp) {
    return res.status(404).json({
      success: false,
      message: 'Camp not found'
    });
  }
  
  // Check if user owns this camp
  if (camp.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  camp.status = 'completed';
  if (actualPatients !== undefined) {
    camp.actualPatients = actualPatients;
  }
  
  await camp.save();
  
  res.status(200).json({
    success: true,
    message: 'Camp marked as completed',
    data: { camp }
  });
});

// @desc    Add medicine usage to camp
// @route   POST /api/camps/:id/medicines
// @access  Private (Doctor only)
const addMedicineUsage = asyncHandler(async (req, res) => {
  const { medicineId, quantityUsed } = req.body;
  
  const camp = await Camp.findById(req.params.id);
  
  if (!camp) {
    return res.status(404).json({
      success: false,
      message: 'Camp not found'
    });
  }
  
  // Check if user owns this camp
  if (camp.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  // Check if medicine already exists in the list
  const existingMedicine = camp.medicinesUsed.find(
    med => med.medicineId.toString() === medicineId
  );
  
  if (existingMedicine) {
    existingMedicine.quantityUsed += quantityUsed;
  } else {
    camp.medicinesUsed.push({ medicineId, quantityUsed });
  }
  
  await camp.save();
  await camp.populate('medicinesUsed.medicineId', 'name size unit');
  
  res.status(200).json({
    success: true,
    message: 'Medicine usage added successfully',
    data: { camp }
  });
});

// @desc    Get upcoming camps
// @route   GET /api/camps/upcoming
// @access  Private (Doctor/Patient)
const getUpcomingCamps = asyncHandler(async (req, res) => {
  let camps;

  if (req.user.role === 'doctor') {
    camps = await Camp.getUpcomingCamps(req.user.id);
  } else {
    const today = new Date();
    camps = await Camp.find({
      isActive: true,
      date: { $gte: today },
      status: { $in: ['scheduled', 'ongoing'] }
    }).sort({ date: 1 });
  }
  
  res.status(200).json({
    success: true,
    data: { camps }
  });
});

// @desc    Get camp statistics for doctor
// @route   GET /api/camps/stats
// @access  Private (Doctor only)
const getCampStats = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;
  
  // Total camps
  const totalCamps = await Camp.countDocuments({ 
    doctorId, 
    isActive: true 
  });
  
  // Camps by status
  const statusStats = await Camp.aggregate([
    { $match: { doctorId: doctorId, isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Camps by type
  const typeStats = await Camp.aggregate([
    { $match: { doctorId: doctorId, isActive: true } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
  
  // Recent camps (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCamps = await Camp.countDocuments({
    doctorId,
    isActive: true,
    date: { $gte: thirtyDaysAgo }
  });
  
  // Total patients treated
  const totalPatients = await Camp.aggregate([
    { $match: { doctorId: doctorId, isActive: true, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$actualPatients' } } }
  ]);
  
  // Upcoming camps count
  const today = new Date();
  const upcomingCamps = await Camp.countDocuments({
    doctorId,
    isActive: true,
    date: { $gte: today },
    status: { $in: ['scheduled', 'ongoing'] }
  });
  
  res.status(200).json({
    success: true,
    data: {
      totalCamps,
      statusStats,
      typeStats,
      recentCamps,
      totalPatients: totalPatients[0]?.total || 0,
      upcomingCamps
    }
  });
});

// @desc    Register current patient for a camp
// @route   POST /api/camps/:id/register
// @access  Private (Patient only)
const registerForCamp = asyncHandler(async (req, res) => {
  const camp = await Camp.findById(req.params.id);

  if (!camp || !camp.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Camp not found'
    });
  }

  const alreadyRegistered = await Patient.findOne({
    userId: req.user.id,
    type: 'camp',
    campId: camp._id,
    isActive: true
  });

  if (alreadyRegistered) {
    return res.status(200).json({
      success: true,
      message: 'You are already registered for this camp',
      data: { patient: alreadyRegistered }
    });
  }

  const basePatient = await Patient.findOne({
    userId: req.user.id,
    isActive: true
  }).sort({ updatedAt: -1, createdAt: -1 });

  if (!basePatient) {
    return res.status(403).json({
      success: false,
      message: 'Patient profile not found. Please contact doctor first.'
    });
  }

  let patientId;
  let counter = (await Patient.countDocuments({ doctorId: camp.doctorId })) + 1;

  while (!patientId) {
    const candidate = `PAT${String(counter).padStart(4, '0')}`;
    const exists = await Patient.findOne({ patientId: candidate });
    if (!exists) {
      patientId = candidate;
    } else {
      counter += 1;
    }
  }

  const registeredPatient = await Patient.create({
    patientId,
    name: basePatient.name,
    mobile: basePatient.mobile,
    email: basePatient.email,
    userId: req.user.id,
    age: basePatient.age,
    gender: basePatient.gender,
    address: basePatient.address,
    medicalHistory: basePatient.medicalHistory,
    type: 'camp',
    campId: camp._id,
    doctorId: camp.doctorId
  });

  camp.actualPatients = (camp.actualPatients || 0) + 1;
  await camp.save();

  return res.status(201).json({
    success: true,
    message: 'Camp registration successful',
    data: { patient: registeredPatient }
  });
});

module.exports = {
  getCamps,
  getCamp,
  createCamp,
  updateCamp,
  deleteCamp,
  completeCamp,
  addMedicineUsage,
  getUpcomingCamps,
  getCampStats,
  registerForCamp
};