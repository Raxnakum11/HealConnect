const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Camp name is required'],
    trim: true,
    maxlength: [200, 'Camp name cannot exceed 200 characters']
  },
  location: {
    type: String,
    required: [true, 'Camp location is required'],
    trim: true,
    maxlength: [300, 'Location cannot exceed 300 characters']
  },
  date: {
    type: Date,
    required: [true, 'Camp date is required']
  },
  time: {
    type: String,
    required: [true, 'Camp time is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['camp', 'clinic'],
    default: 'camp'
  },
  organizer: {
    type: String,
    required: [true, 'Organizer name is required'],
    trim: true,
    maxlength: [100, 'Organizer name cannot exceed 100 characters']
  },
  organizerContact: {
    type: String,
    required: [true, 'Organizer contact is required'],
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Please enter a valid 10-digit mobile number'
    }
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
  },
  expectedPatients: {
    type: Number,
    min: [0, 'Expected patients must be a positive number'],
    default: 0
  },
  actualPatients: {
    type: Number,
    min: [0, 'Actual patients must be a positive number'],
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  medicinesUsed: [{
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine'
    },
    quantityUsed: {
      type: Number,
      min: [0, 'Quantity used must be a positive number']
    }
  }],
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
campSchema.index({ doctorId: 1 });
campSchema.index({ date: 1 });
campSchema.index({ status: 1 });
campSchema.index({ type: 1 });
campSchema.index({ location: 'text', name: 'text', organizer: 'text' });

// Virtual for patients count
campSchema.virtual('patientsCount').get(function() {
  return this.actualPatients > 0 ? this.actualPatients : this.expectedPatients;
});

// Virtual for camp duration (assuming it's over when status is completed)
campSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Virtual for upcoming camps
campSchema.virtual('isUpcoming').get(function() {
  const today = new Date();
  return this.date > today && this.status === 'scheduled';
});

// Method to mark camp as completed
campSchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

// Method to add medicine usage
campSchema.methods.addMedicineUsage = function(medicineId, quantityUsed) {
  const existingMedicine = this.medicinesUsed.find(m => m.medicineId.equals(medicineId));
  
  if (existingMedicine) {
    existingMedicine.quantityUsed += quantityUsed;
  } else {
    this.medicinesUsed.push({ medicineId, quantityUsed });
  }
  
  return this.save();
};

// Static method to get upcoming camps
campSchema.statics.getUpcomingCamps = function(doctorId) {
  const today = new Date();
  return this.find({
    doctorId,
    date: { $gte: today },
    status: { $in: ['scheduled', 'ongoing'] },
    isActive: true
  }).sort({ date: 1 });
};

module.exports = mongoose.model('Camp', campSchema);