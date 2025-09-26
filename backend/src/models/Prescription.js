const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: [true, 'Medicine ID is required']
  },
  medicineName: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: ['Once daily', 'Twice daily', 'Thrice daily', 'Four times daily', 'As needed', 'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'Custom'],
    default: 'Twice daily'
  },
  customFrequency: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  timing: {
    type: String,
    enum: ['Before meals', 'After meals', 'With meals', 'Empty stomach', 'At bedtime', 'As directed'],
    default: 'After meals'
  },
  quantityGiven: {
    type: Number,
    required: [true, 'Quantity given is required'],
    min: [0, 'Quantity must be a positive number']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Instructions cannot exceed 500 characters']
  }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
  },
  campId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camp'
  },
  visitId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Visit ID is required']
  },
  prescriptionNumber: {
    type: String,
    unique: true,
    required: [true, 'Prescription number is required']
  },
  medicines: [prescriptionItemSchema],
  symptoms: {
    type: String,
    required: [true, 'Symptoms are required'],
    trim: true,
    maxlength: [1000, 'Symptoms cannot exceed 1000 characters']
  },
  diagnosis: {
    type: String,
    trim: true,
    maxlength: [500, 'Diagnosis cannot exceed 500 characters']
  },
  additionalNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Additional notes cannot exceed 1000 characters']
  },
  followUpDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'discontinued'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
prescriptionSchema.index({ patientId: 1 });
prescriptionSchema.index({ doctorId: 1 });
prescriptionSchema.index({ campId: 1 });
prescriptionSchema.index({ prescriptionNumber: 1 });
prescriptionSchema.index({ createdAt: -1 });
prescriptionSchema.index({ status: 1 });

// Virtual for total medicines count
prescriptionSchema.virtual('medicinesCount').get(function() {
  return this.medicines.length;
});

// Virtual for prescription age
prescriptionSchema.virtual('prescriptionAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to generate prescription number
prescriptionSchema.pre('save', async function(next) {
  if (this.isNew && !this.prescriptionNumber) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Count prescriptions for today
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const sequenceNumber = String(count + 1).padStart(3, '0');
    this.prescriptionNumber = `RX${year}${month}${day}${sequenceNumber}`;
  }
  next();
});

// Method to add medicine to prescription
prescriptionSchema.methods.addMedicine = function(medicineData) {
  this.medicines.push(medicineData);
  return this.save();
};

// Method to remove medicine from prescription
prescriptionSchema.methods.removeMedicine = function(medicineId) {
  this.medicines = this.medicines.filter(med => !med.medicineId.equals(medicineId));
  return this.save();
};

// Method to mark prescription as completed
prescriptionSchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

// Static method to get patient's prescription history
prescriptionSchema.statics.getPatientHistory = function(patientId, limit = 10) {
  return this.find({ patientId, isActive: true })
    .populate('doctorId', 'firstName lastName specialization')
    .populate('campId', 'name location date')
    .populate('medicines.medicineId', 'name size unit')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get doctor's prescriptions
prescriptionSchema.statics.getDoctorPrescriptions = function(doctorId, status = null) {
  const query = { doctorId, isActive: true };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('patientId', 'firstName lastName age gender mobileNumber')
    .populate('campId', 'name location date')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Prescription', prescriptionSchema);