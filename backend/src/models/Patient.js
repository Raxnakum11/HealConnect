const mongoose = require('mongoose');

const visitRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  symptoms: {
    type: String,
    required: [true, 'Symptoms are required'],
    trim: true
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true
  },
  prescription: {
    type: String,
    required: [true, 'Prescription is required'],
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: true });

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^\d{10,12}$/, 'Please enter a valid mobile number (10-12 digits)']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true // Allow null values but ensure uniqueness when present
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age must be a positive number'],
    max: [150, 'Age cannot exceed 150']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  medicalHistory: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['clinic', 'camp'],
    required: [true, 'Patient type is required']
  },
  campId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camp',
    required: function() {
      return this.type === 'camp';
    }
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      // Only required if patient type is 'camp' or if explicitly created by doctor
      return this.type === 'camp';
    }
  },
  lastVisit: {
    type: Date,
    default: Date.now
  },
  nextAppointment: {
    type: Date
  },
  visitHistory: [visitRecordSchema],
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
patientSchema.index({ patientId: 1 });
patientSchema.index({ doctorId: 1 });
patientSchema.index({ type: 1 });
patientSchema.index({ campId: 1 });
patientSchema.index({ mobile: 1 });

// Virtual for prescriptions
patientSchema.virtual('prescriptions', {
  ref: 'Prescription',
  localField: '_id',
  foreignField: 'patientId'
});

module.exports = mongoose.model('Patient', patientSchema);