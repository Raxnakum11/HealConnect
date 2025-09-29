const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required'],
    trim: true
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: [
      'consultation', 
      'followup', 
      'checkup', 
      'homeopathy_consultation', 
      'constitutional_treatment',
      'specialist_consultation',
      'diagnostic_review',
      'emergency'
    ]
  },
  reason: {
    type: String,
    required: [true, 'Appointment reason is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  cancelReason: {
    type: String,
    trim: true
  },
  slotNumber: {
    type: Number,
    min: 1,
    max: 10
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, status: 1 });

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Static method to get available slots for a date
appointmentSchema.statics.getAvailableSlots = async function(doctorId, date) {
  const appointments = await this.find({
    doctorId,
    date: {
      $gte: new Date(date),
      $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
    },
    status: { $in: ['pending', 'approved'] }
  }).select('timeSlot');

  const bookedSlots = appointments.map(apt => apt.timeSlot);
  const allSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  return allSlots.filter(slot => !bookedSlots.includes(slot));
};

module.exports = mongoose.model('Appointment', appointmentSchema);