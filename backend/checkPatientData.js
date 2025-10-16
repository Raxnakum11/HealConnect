const mongoose = require('mongoose');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient'); 
const Appointment = require('./src/models/Appointment');

mongoose.connect('mongodb://localhost:27017/healthcare', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const patients = await Patient.find().populate('userId', 'name email mobile');
    console.log('Patients found:', patients.length);
    patients.forEach((patient, index) => {
      console.log(`Patient ${index + 1}:`, {
        _id: patient._id,
        userId: patient.userId?._id,
        name: patient.userId?.name,
        email: patient.userId?.email
      });
    });
    
    const appointments = await Appointment.find().populate('patientId', 'userId').populate('doctorId', 'name');
    console.log('\nAppointments found:', appointments.length);
    appointments.forEach((appointment, index) => {
      console.log(`Appointment ${index + 1}:`, {
        _id: appointment._id,
        patientId: appointment.patientId?._id,
        patientUserId: appointment.patientId?.userId,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        status: appointment.status
      });
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });