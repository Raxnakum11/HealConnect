const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    maxlength: [100, 'Medicine name cannot exceed 100 characters']
  },
  batch: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be a positive number']
  },
  size: {
    type: String,
    required: [true, 'Medicine size is required'],
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['mg', 'g', 'ml', 'tablets', 'capsules', 'drops', 'syrup']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['clinic', 'camp', 'others'],
    required: [true, 'Medicine type is required']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
  },
  cost: {
    type: Number,
    min: [0, 'Cost must be a positive number']
  },
  manufacturer: {
    type: String,
    trim: true
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
medicineSchema.index({ doctorId: 1 });
medicineSchema.index({ type: 1 });
medicineSchema.index({ priority: 1 });
medicineSchema.index({ expiryDate: 1 });
medicineSchema.index({ name: 'text', batch: 'text' });

// Virtual for days until expiry
medicineSchema.virtual('daysToExpiry').get(function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for full medicine name with size and unit
medicineSchema.virtual('fullName').get(function() {
  return `${this.name} ${this.size}${this.unit}`;
});

// Method to check if medicine is expiring soon (within 30 days)
medicineSchema.methods.isExpiringSoon = function() {
  return this.daysToExpiry <= 30;
};

module.exports = mongoose.model('Medicine', medicineSchema);