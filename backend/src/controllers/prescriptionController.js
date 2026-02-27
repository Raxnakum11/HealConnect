const mongoose = require('mongoose');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all prescriptions for a doctor
// @route   GET /api/prescriptions
// @access  Private (Doctor only)
const getPrescriptions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const status = req.query.status;
  const patientId = req.query.patientId;
  const campId = req.query.campId;
  
  // Build query
  const query = { doctorId: req.user.id, isActive: true };
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Filter by patient
  if (patientId) {
    query.patientId = patientId;
  }
  
  // Filter by camp
  if (campId) {
    query.campId = campId;
  }
  
  const prescriptions = await Prescription.find(query)
    .populate('patientId', 'firstName lastName age gender mobileNumber')
    .populate('campId', 'name location date')
    .populate('medicines.medicineId', 'name size unit batch')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Prescription.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      prescriptions,
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

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patientId', 'firstName lastName age gender mobileNumber email address')
    .populate('doctorId', 'firstName lastName specialization')
    .populate('campId', 'name location date')
    .populate('medicines.medicineId', 'name size unit batch manufacturer');
  
  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }
  
  // Check if user has access to this prescription
  if (req.user.role === 'doctor' && prescription.doctorId._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  if (req.user.role === 'patient' && prescription.patientId._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  res.status(200).json({
    success: true,
    data: { prescription }
  });
});

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
const createPrescription = asyncHandler(async (req, res) => {
  console.log('🔥 Creating prescription...');
  console.log('🔥 Request body:', JSON.stringify(req.body, null, 2));
  console.log('🔥 User ID:', req.user?.id);
  
  const {
    patientId,
    campId,
    visitId,
    medicines,
    symptoms,
    diagnosis,
    additionalNotes,
    followUpDate
  } = req.body;
  
  // Validate patientId format
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    console.log('🔥 Invalid patientId format:', patientId);
    return res.status(400).json({
      success: false,
      message: 'Invalid patient ID format. Please select a valid patient.'
    });
  }

  // Find patient and update doctor association if needed
  console.log('🔥 Looking for patient:', patientId, 'for doctor:', req.user.id);
  let patient = await Patient.findOne({
    _id: patientId,
    isActive: true
  });
  
  console.log('🔥 Found patient:', patient ? 'YES' : 'NO');
  
  if (!patient) {
    console.log('🔥 Patient not found');
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }
  
  // Update patient's doctor association if not set
  if (!patient.doctorId || patient.doctorId.toString() !== req.user.id) {
    console.log('🔥 Updating patient doctor association');
    patient.doctorId = req.user.id;
    await patient.save();
  }
  
  // Validate medicines and check availability
  const validatedMedicines = [];
  
  for (const med of medicines) {
    // Validate medicineId format
    if (!mongoose.Types.ObjectId.isValid(med.medicineId)) {
      console.log('🔥 Invalid medicineId format:', med.medicineId);
      return res.status(400).json({
        success: false,
        message: `Invalid medicine ID format: ${med.medicineId}. Please select valid medicines.`
      });
    }

    const medicine = await Medicine.findOne({
      _id: med.medicineId,
      doctorId: req.user.id,
      isActive: true
    });
    
    if (!medicine) {
      return res.status(400).json({
        success: false,
        message: `Medicine with ID ${med.medicineId} not found`
      });
    }
    
    if (medicine.quantity < med.quantityGiven) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity for medicine ${medicine.name}. Available: ${medicine.quantity}, Required: ${med.quantityGiven}`
      });
    }
    
    validatedMedicines.push({
      medicineId: med.medicineId,
      medicineName: medicine.name,
      dosage: med.dosage,
      frequency: med.frequency,
      customFrequency: med.customFrequency,
      duration: med.duration,
      timing: med.timing,
      quantityGiven: med.quantityGiven,
      instructions: med.instructions
    });
  }
  
  // Get doctor info
  const doctor = await require('../models/User').findById(req.user.id);
  
  // Generate a proper visitId as ObjectId
  const visitObjectId = new mongoose.Types.ObjectId();
  
  // Generate prescription number manually
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  // Count prescriptions for today to generate sequence number
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  const prescriptionCount = await Prescription.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const sequenceNumber = String(prescriptionCount + 1).padStart(3, '0');
  const prescriptionNumber = `RX${year}${month}${day}${sequenceNumber}`;
  
  console.log('🔥 Generated prescription number:', prescriptionNumber);
  
  // Create prescription
  console.log('🔥 Creating prescription with data:', {
    patientId,
    doctorId: req.user.id,
    campId,
    visitId: visitObjectId,
    prescriptionNumber,
    medicines: validatedMedicines,
    symptoms,
    diagnosis,
    additionalNotes,
    followUpDate
  });
  
  const prescription = new Prescription({
    patientId,
    doctorId: req.user.id,
    campId,
    visitId: visitObjectId, // Use proper ObjectId
    prescriptionNumber, // Add prescription number manually
    medicines: validatedMedicines,
    symptoms,
    diagnosis,
    additionalNotes,
    followUpDate
  });
  
  await prescription.save();
  
  console.log('🔥 Prescription created successfully:', prescription._id);

  // Update medicine quantities
  const medicineUpdates = [];
  for (const med of medicines) {
    await Medicine.findByIdAndUpdate(
      med.medicineId,
      { $inc: { quantity: -med.quantityGiven } }
    );
    medicineUpdates.push({
      medicineId: med.medicineId,
      medicineName: validatedMedicines.find(vm => vm.medicineId.toString() === med.medicineId.toString()).medicineName,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      quantityGiven: med.quantityGiven
    });
  }

  // Create visit history record
  const visitRecord = {
    date: new Date(),
    doctorId: req.user.id,
    doctorName: `${doctor.firstName} ${doctor.lastName}`,
    symptoms,
    diagnosis,
    prescriptionId: prescription._id,
    prescribedMedicines: medicineUpdates,
    instructions: additionalNotes,
    nextVisitDate: followUpDate,
    notes: '',
    campId
  };

  // Add visit record to patient history
  console.log('🔥 Adding visit record to patient history:', visitRecord);
  
  await Patient.findByIdAndUpdate(
    patientId,
    { 
      $push: { visitHistory: visitRecord },
      lastVisit: new Date(),
      nextAppointment: followUpDate
    }
  );
  
  console.log('🔥 Visit history updated successfully');  // Populate the prescription data
  await prescription.populate([
    { path: 'patientId', select: 'firstName lastName age gender mobileNumber' },
    { path: 'campId', select: 'name location date' },
    { path: 'medicines.medicineId', select: 'name size unit batch' }
  ]);
  
  res.status(201).json({
    success: true,
    message: 'Prescription created successfully',
    data: { prescription }
  });
});

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (Doctor only)
const updatePrescription = asyncHandler(async (req, res) => {
  let prescription = await Prescription.findById(req.params.id);
  
  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }
  
  // Check if user owns this prescription
  if (prescription.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  // Only allow updates if prescription is still active
  if (prescription.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update completed prescription'
    });
  }
  
  // Fields that can be updated
  const allowedFields = [
    'symptoms', 'diagnosis', 'additionalNotes', 'followUpDate', 'status'
  ];
  
  const fieldsToUpdate = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });
  
  prescription = await Prescription.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).populate([
    { path: 'patientId', select: 'firstName lastName age gender mobileNumber' },
    { path: 'campId', select: 'name location date' },
    { path: 'medicines.medicineId', select: 'name size unit batch' }
  ]);
  
  res.status(200).json({
    success: true,
    message: 'Prescription updated successfully',
    data: { prescription }
  });
});

// @desc    Delete prescription (soft delete)
// @route   DELETE /api/prescriptions/:id
// @access  Private (Doctor only)
const deletePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  
  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }
  
  // Check if user owns this prescription
  if (prescription.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  // Only allow deletion if prescription is not completed
  if (prescription.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete completed prescription'
    });
  }
  
  // Return medicines to inventory
  for (const med of prescription.medicines) {
    await Medicine.findByIdAndUpdate(
      med.medicineId,
      { $inc: { quantity: med.quantityGiven } }
    );
  }
  
  // Remove from patient's prescriptions
  await Patient.findByIdAndUpdate(
    prescription.patientId,
    { $pull: { prescriptions: prescription._id } }
  );
  
  // Soft delete
  prescription.isActive = false;
  await prescription.save();
  
  res.status(200).json({
    success: true,
    message: 'Prescription deleted successfully'
  });
});

// @desc    Mark prescription as completed
// @route   PATCH /api/prescriptions/:id/complete
// @access  Private (Doctor only)
const completePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  
  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }
  
  // Check if user owns this prescription
  if (prescription.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  prescription.status = 'completed';
  await prescription.save();
  
  res.status(200).json({
    success: true,
    message: 'Prescription marked as completed',
    data: { prescription }
  });
});

// @desc    Get patient's prescription history
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  
  // Check if user has access to this patient
  if (req.user.role === 'doctor') {
    const patient = await Patient.findOne({
      _id: patientId,
      doctorId: req.user.id
    });
    
    if (!patient) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  } else if (req.user.role === 'patient' && req.user.id !== patientId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  const prescriptions = await Prescription.getPatientHistory(patientId, limit);
  
  res.status(200).json({
    success: true,
    data: { prescriptions }
  });
});

// @desc    Get prescription statistics for doctor
// @route   GET /api/prescriptions/stats
// @access  Private (Doctor only)
const getPrescriptionStats = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;
  
  // Total prescriptions
  const totalPrescriptions = await Prescription.countDocuments({ 
    doctorId, 
    isActive: true 
  });
  
  // Prescriptions by status
  const statusStats = await Prescription.aggregate([
    { $match: { doctorId: doctorId, isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Recent prescriptions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentPrescriptions = await Prescription.countDocuments({
    doctorId,
    isActive: true,
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  // Most prescribed medicines
  const topMedicines = await Prescription.aggregate([
    { $match: { doctorId: doctorId, isActive: true } },
    { $unwind: '$medicines' },
    { 
      $group: { 
        _id: '$medicines.medicineName', 
        count: { $sum: 1 },
        totalQuantity: { $sum: '$medicines.quantityGiven' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      totalPrescriptions,
      statusStats,
      recentPrescriptions,
      topMedicines
    }
  });
});

// @desc    Get patient's own prescriptions
// @route   GET /api/prescriptions/my-prescriptions
// @access  Private (Patient only)
const getMyPrescriptions = asyncHandler(async (req, res) => {
  // Find patient record linked to user
  const patient = await Patient.findOne({ 
    userId: req.user.id,
    isActive: true 
  });
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient record not found'
    });
  }

  // Get prescriptions for this patient
  const prescriptions = await Prescription.find({ 
    patientId: patient._id,
    isActive: true 
  })
    .populate('doctorId', 'firstName lastName specialization')
    .populate('campId', 'name location date')
    .sort({ createdAt: -1 });

  // Format prescriptions for patient view
  const formattedPrescriptions = prescriptions.map(prescription => {
    // Safely get doctor name
    let doctorName = 'Dr. Unknown';
    if (prescription.doctorId) {
      const firstName = prescription.doctorId.firstName || '';
      const lastName = prescription.doctorId.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      doctorName = fullName ? `Dr. ${fullName}` : 'Dr. Himanshu Sonagara';
    }
    
    return {
      id: prescription._id,
      prescribedDate: prescription.createdAt,
      doctorName: doctorName,
      instructions: prescription.additionalNotes || 'Take as directed',
      nextVisitDate: prescription.followUpDate,
      priority: prescription.status === 'active' ? 'medium' : 'low',
      type: prescription.status === 'active' ? 'current' : 'past',
      status: prescription.status,
      symptoms: prescription.symptoms,
      diagnosis: prescription.diagnosis,
      campInfo: prescription.campId ? {
        name: prescription.campId.name,
        location: prescription.campId.location
      } : null
    };
  });

  res.status(200).json({
    success: true,
    data: { prescriptions: formattedPrescriptions }
  });
});

module.exports = {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
  completePrescription,
  getPatientPrescriptions,
  getPrescriptionStats,
  getMyPrescriptions
};