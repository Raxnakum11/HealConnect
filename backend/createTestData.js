const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Appointment = require('./src/models/Appointment');
const Prescription = require('./src/models/Prescription');

mongoose.connect('mongodb://localhost:27017/healconnect_db', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Create a doctor user (let the model handle password hashing)
    const doctorUser = new User({
      name: 'Dr. Himanshu Sonagara',
      email: 'doctor@hospital.com',
      password: 'password123',
      role: 'doctor',
      mobile: '9876543220',
      specialization: 'allopathy'
    });
    await doctorUser.save();
    console.log('Doctor user created:', doctorUser._id);
    
    // Create a patient user
    const patientUser = new User({
      name: 'John Doe',
      email: 'patient@example.com',
      password: 'password123',
      role: 'patient',
      mobile: '9876543221'
    });
    await patientUser.save();
    console.log('Patient user created:', patientUser._id);
    
    // Create patient profile
    const patient = new Patient({
      patientId: 'P001',
      name: 'John Doe',
      mobile: '9876543221',
      email: 'patient@example.com',
      userId: patientUser._id,
      age: 30,
      gender: 'Male',
      address: '123 Main Street, City',
      medicalHistory: 'No known allergies. Previous surgery: Appendectomy in 2020.',
      type: 'clinic'
    });
    await patient.save();
    console.log('Patient profile created:', patient._id);
    
    // Create some appointments for the patient
    const appointment1 = new Appointment({
      patientId: patient._id,
      patientName: 'John Doe',
      doctorId: doctorUser._id,
      date: new Date('2025-01-15'),
      time: '10:00 AM',
      timeSlot: '10:00 AM',
      type: 'consultation',
      reason: 'Regular checkup',
      status: 'approved'
    });
    await appointment1.save();
    
    const appointment2 = new Appointment({
      patientId: patient._id,
      patientName: 'John Doe',
      doctorId: doctorUser._id,
      date: new Date('2025-01-20'),
      time: '02:30 PM',
      timeSlot: '02:30 PM',
      type: 'followup',
      reason: 'Blood pressure monitoring',
      status: 'pending'
    });
    await appointment2.save();
    
    console.log('Appointments created:', 2);
    
    // Create a prescription for the patient
    const prescription = new Prescription({
      patientId: patient._id,
      doctorId: doctorUser._id,
      medicines: [
        {
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'twice daily',
          duration: '7 days',
          instructions: 'Take after meals'
        }
      ],
      instructions: 'Take Paracetamol 500mg twice daily after meals for fever and headache. Monitor temperature daily. Stay hydrated and get adequate rest. Return if fever persists beyond 3 days or if temperature exceeds 102°F.',
      date: new Date(),
      nextVisitDate: new Date('2025-01-25')
    });
    await prescription.save();
    
    console.log('Prescription created:', prescription._id);
    
    console.log('\n=== Test Data Created Successfully ===');
    console.log('Doctor User ID:', doctorUser._id);
    console.log('Patient User ID:', patientUser._id);
    console.log('Patient Profile ID:', patient._id);
    console.log('\nTest login credentials:');
    console.log('Email: patient@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error creating test data:', err);
    process.exit(1);
  });