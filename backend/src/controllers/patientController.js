const Patient = require('../models/Patient');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all patients for a doctor
// @route   GET /api/patients
// @access  Private (Doctor only)
const getPatients = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = req.query.search || '';
  const campId = req.query.campId;

  // Build query
  let query = { isActive: true };

  // For doctors: show their assigned patients AND unassigned patients
  if (req.user.role === 'doctor') {
    query = {
      $and: [
        { isActive: true },
        {
          $or: [
            { doctorId: req.user.id },  // Patients assigned to this doctor
            { doctorId: { $exists: false } }, // Unassigned patients
            { doctorId: null } // Patients with null doctorId
          ]
        }
      ]
    };
  } else if (req.user.role === 'patient') {
    // For patients: only show their own record
    query.userId = req.user.id;
  }

  // Add search functionality
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { mobileNumber: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by camp if provided
  if (campId) {
    query.campId = campId;
  }

  const patients = await Patient.find(query)
    .populate('campId', 'title location date')
    .populate('prescriptions', 'prescriptionNumber createdAt status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Patient.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      patients,
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

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate('doctorId', 'name specialization')
    .populate('campId', 'title location date')
    .populate('prescriptions');

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Check if user has access to this patient
  if (req.user.role === 'doctor' && patient.doctorId && patient.doctorId._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Patients can only view their own record
  if (req.user.role === 'patient' && (!patient.userId || patient.userId.toString() !== req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.status(200).json({
    success: true,
    data: { patient }
  });
});

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private (Doctor only)
const createPatient = asyncHandler(async (req, res) => {
  const {
    name,
    age,
    gender,
    mobile,
    email,
    address,
    medicalHistory,
    type,
    campId
  } = req.body;

  // Check if patient with same mobile number already exists for this doctor
  const existingPatient = await Patient.findOne({
    mobile,
    doctorId: req.user.id,
    isActive: true
  });

  if (existingPatient) {
    return res.status(400).json({
      success: false,
      message: 'Patient with this mobile number already exists'
    });
  }

  // Generate unique patient ID
  let patientId;
  let isUnique = false;
  let counter = 1;

  // Get the highest existing patient number for this doctor
  const lastPatient = await Patient.findOne(
    { doctorId: req.user.id },
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

  // Create patient with email
  const patient = await Patient.create({
    patientId,
    name,
    age,
    gender,
    mobile,
    email: email || undefined, // Include email if provided
    address,
    medicalHistory,
    type,
    campId: type === 'camp' ? campId : undefined,
    doctorId: req.user.id
  });

  // Populate the patient data if campId exists
  if (patient.campId) {
    await patient.populate('campId', 'title location date');
  }

  res.status(201).json({
    success: true,
    message: 'Patient created successfully',
    data: patient
  });
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (Doctor only)
const updatePatient = asyncHandler(async (req, res) => {
  let patient = await Patient.findById(req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Check if user owns this patient
  if (patient.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Fields that can be updated
  const allowedFields = [
    'firstName', 'lastName', 'age', 'gender', 'mobileNumber',
    'email', 'address', 'previousTreatment', 'allergies', 'chronicDiseases'
  ];

  const fieldsToUpdate = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  // Check if mobile number is being changed and not already taken
  if (fieldsToUpdate.mobileNumber && fieldsToUpdate.mobileNumber !== patient.mobileNumber) {
    const existingPatient = await Patient.findOne({
      mobileNumber: fieldsToUpdate.mobileNumber,
      doctorId: req.user.id,
      _id: { $ne: req.params.id },
      isActive: true
    });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this mobile number already exists'
      });
    }
  }

  patient = await Patient.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).populate('campId', 'title location date');

  res.status(200).json({
    success: true,
    message: 'Patient updated successfully',
    data: { patient }
  });
});

// @desc    Delete patient (soft delete)
// @route   DELETE /api/patients/:id
// @access  Private (Doctor only)
const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Check if user owns this patient
  if (patient.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Soft delete
  patient.isActive = false;
  await patient.save();

  res.status(200).json({
    success: true,
    message: 'Patient deleted successfully'
  });
});

// @desc    Add new visit for patient
// @route   POST /api/patients/:id/visits
// @access  Private (Doctor only)
const addVisit = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Check if user owns this patient
  if (patient.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const { campId, clinicType, symptoms } = req.body;

  const visit = {
    campId: campId || null,
    clinicType: clinicType || 'clinic',
    symptoms,
    visitDate: new Date()
  };

  patient.visitHistory.push(visit);
  await patient.save();
  await patient.populate('campId', 'title location date');

  res.status(201).json({
    success: true,
    message: 'Visit added successfully',
    data: { patient }
  });
});

// @desc    Get patient statistics for doctor
// @route   GET /api/patients/stats
// @access  Private (Doctor only)
const getPatientStats = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;

  // Total patients
  const totalPatients = await Patient.countDocuments({
    doctorId,
    isActive: true
  });

  // Patients by gender
  const genderStats = await Patient.aggregate([
    { $match: { doctorId: doctorId, isActive: true } },
    { $group: { _id: '$gender', count: { $sum: 1 } } }
  ]);

  // Patients by age groups
  const ageStats = await Patient.aggregate([
    { $match: { doctorId: doctorId, isActive: true } },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ['$age', 18] }, then: 'Under 18' },
              { case: { $lt: ['$age', 30] }, then: '18-29' },
              { case: { $lt: ['$age', 50] }, then: '30-49' },
              { case: { $lt: ['$age', 65] }, then: '50-64' }
            ],
            default: '65+'
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  // Recent patients (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentPatients = await Patient.countDocuments({
    doctorId,
    isActive: true,
    createdAt: { $gte: thirtyDaysAgo }
  });

  res.status(200).json({
    success: true,
    data: {
      totalPatients,
      genderStats,
      ageStats,
      recentPatients
    }
  });
});

// @desc    Assign unassigned patient to doctor
// @route   PUT /api/patients/:id/assign
// @access  Private (Doctor only)
const assignPatientToDoctor = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Check if patient is already assigned to another doctor
  if (patient.doctorId && patient.doctorId.toString() !== req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'Patient is already assigned to another doctor'
    });
  }

  // Assign patient to the current doctor
  patient.doctorId = req.user.id;
  await patient.save();

  await patient.populate('doctorId', 'name specialization');

  res.status(200).json({
    success: true,
    message: 'Patient assigned successfully',
    data: { patient }
  });
});

// @desc    Update patient email
// @route   PUT /api/patients/:id/email
// @access  Private (Doctor only)
const updatePatientEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required'
    });
  }

  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Check if doctor has access to this patient
  if (patient.doctorId && patient.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Update email
  patient.email = email.toLowerCase().trim();

  // If patient is unassigned, assign to current doctor
  if (!patient.doctorId) {
    patient.doctorId = req.user.id;
  }

  await patient.save();
  await patient.populate('doctorId', 'name specialization');

  res.status(200).json({
    success: true,
    message: 'Patient email updated successfully',
    data: { patient }
  });
});

// @desc    Get patient visit history
// @route   GET /api/patients/:id/visit-history
// @access  Private
const getPatientVisitHistory = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate('visitHistory.doctorId', 'name')
    .populate('visitHistory.prescribedMedicines.medicineId', 'name size unit')
    .populate('visitHistory.campId', 'name location date');

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Check if user has access to this patient
  if (req.user.role === 'doctor' && patient.doctorId && patient.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  if (req.user.role === 'patient' && patient.userId && patient.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Sort visit history by date (newest first)
  const sortedVisitHistory = patient.visitHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

  const normalizedVisitHistory = sortedVisitHistory.map((visit) => {
    const visitObj = typeof visit.toObject === 'function' ? visit.toObject() : visit;
    const doctorNameFromRef =
      visitObj?.doctorId && typeof visitObj.doctorId === 'object' ? visitObj.doctorId.name : '';
    const rawDoctorName = (visitObj?.doctorName || '').trim();
    const isInvalidDoctorName =
      !rawDoctorName || /^undefined(\s+undefined)?$/i.test(rawDoctorName);

    return {
      ...visitObj,
      doctorName: doctorNameFromRef || (isInvalidDoctorName ? 'Dr. Himanshu Sonagara' : rawDoctorName)
    };
  });

  res.status(200).json({
    success: true,
    data: {
      visitHistory: normalizedVisitHistory,
      patientInfo: {
        id: patient._id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        mobile: patient.mobile,
        type: patient.type
      }
    }
  });
});

module.exports = {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  addVisit,
  getPatientStats,
  assignPatientToDoctor,
  updatePatientEmail,
  getPatientVisitHistory
};