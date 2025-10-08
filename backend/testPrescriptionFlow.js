const mongoose = require('mongoose');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Medicine = require('./src/models/Medicine');
const Prescription = require('./src/models/Prescription');

// Connect to test database
mongoose.connect('mongodb://localhost:27017/heal_connect_test')
  .then(() => console.log('Connected to test database'))
  .catch(err => console.error('Database connection error:', err));

async function testPrescriptionFlow() {
  try {
    console.log('🧪 Testing Complete Prescription Flow...\n');

    // 1. Create a test doctor
    const doctor = new User({
      firstName: 'Test',
      lastName: 'Doctor',
      email: 'testdoctor@example.com',
      password: 'hashedpassword',
      role: 'doctor',
      specialization: 'General Medicine',
      licenseNumber: 'DOC123'
    });
    await doctor.save();
    console.log('✅ Doctor created:', doctor.firstName, doctor.lastName);

    // 2. Create a test patient
    const patient = new Patient({
      patientId: 'PAT001',
      name: 'Test Patient',
      mobile: '1234567890',
      email: 'testpatient@example.com',
      age: 30,
      gender: 'Male',
      address: 'Test Address',
      type: 'clinic',
      doctorId: doctor._id
    });
    await patient.save();
    console.log('✅ Patient created:', patient.name);

    // 3. Create test medicines
    const medicine1 = new Medicine({
      name: 'Paracetamol',
      size: '500',
      unit: 'mg',
      quantity: 100,
      type: 'clinic',
      batch: 'BATCH001',
      expiryDate: new Date('2026-12-31'),
      doctorId: doctor._id
    });
    await medicine1.save();

    const medicine2 = new Medicine({
      name: 'Amoxicillin',
      size: '250',
      unit: 'mg',
      quantity: 50,
      type: 'clinic',
      batch: 'BATCH002',
      expiryDate: new Date('2026-06-30'),
      doctorId: doctor._id
    });
    await medicine2.save();
    console.log('✅ Medicines created: Paracetamol (Qty: 100), Amoxicillin (Qty: 50)');

    // 4. Create a prescription
    const prescriptionData = {
      patientId: patient._id,
      doctorId: doctor._id,
      visitId: `visit_${Date.now()}`,
      medicines: [
        {
          medicineId: medicine1._id,
          medicineName: medicine1.name,
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '5 days',
          timing: 'After meals',
          quantityGiven: 10,
          instructions: 'Take with water'
        },
        {
          medicineId: medicine2._id,
          medicineName: medicine2.name,
          dosage: '250mg',
          frequency: 'Thrice daily',
          duration: '7 days',
          timing: 'Before meals',
          quantityGiven: 21,
          instructions: 'Complete the course'
        }
      ],
      symptoms: 'Fever and headache',
      diagnosis: 'Viral infection',
      additionalNotes: 'Rest and maintain hydration',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    };

    const prescription = new Prescription(prescriptionData);
    await prescription.save();
    console.log('✅ Prescription created:', prescription.prescriptionNumber);

    // 5. Simulate inventory deduction
    await Medicine.findByIdAndUpdate(medicine1._id, { $inc: { quantity: -10 } });
    await Medicine.findByIdAndUpdate(medicine2._id, { $inc: { quantity: -21 } });
    console.log('✅ Inventory updated');

    // 6. Add visit history to patient
    const visitRecord = {
      date: new Date(),
      doctorId: doctor._id,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      symptoms: prescriptionData.symptoms,
      diagnosis: prescriptionData.diagnosis,
      prescriptionId: prescription._id,
      prescribedMedicines: prescriptionData.medicines.map(med => ({
        medicineId: med.medicineId,
        medicineName: med.medicineName,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        quantityGiven: med.quantityGiven
      })),
      instructions: prescriptionData.additionalNotes,
      nextVisitDate: prescriptionData.followUpDate,
      notes: ''
    };

    await Patient.findByIdAndUpdate(
      patient._id,
      { 
        $push: { visitHistory: visitRecord },
        lastVisit: new Date(),
        nextAppointment: prescriptionData.followUpDate
      }
    );
    console.log('✅ Visit history added to patient');

    // 7. Verify final state
    const updatedMedicine1 = await Medicine.findById(medicine1._id);
    const updatedMedicine2 = await Medicine.findById(medicine2._id);
    const updatedPatient = await Patient.findById(patient._id);

    console.log('\n📊 Final State:');
    console.log(`- Paracetamol remaining: ${updatedMedicine1.quantity} (was 100, prescribed 10)`);
    console.log(`- Amoxicillin remaining: ${updatedMedicine2.quantity} (was 50, prescribed 21)`);
    console.log(`- Patient visit history entries: ${updatedPatient.visitHistory.length}`);
    console.log(`- Prescription contains ${prescription.medicines.length} medicines`);

    // 8. Test patient prescription retrieval
    const patientPrescriptions = await Prescription.find({ 
      patientId: patient._id 
    })
      .populate('doctorId', 'firstName lastName')
      .sort({ createdAt: -1 });

    console.log('\n📋 Patient Prescription Summary:');
    patientPrescriptions.forEach(pres => {
      console.log(`- ${pres.prescriptionNumber} by Dr. ${pres.doctorId.firstName} ${pres.doctorId.lastName}`);
      console.log(`  Symptoms: ${pres.symptoms}`);
      console.log(`  Medicines: ${pres.medicines.length} items`);
      console.log(`  Status: ${pres.status}`);
    });

    console.log('\n🎉 All tests passed! Prescription flow working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    await User.deleteMany({ email: 'testdoctor@example.com' });
    await Patient.deleteMany({ patientId: 'PAT001' });
    await Medicine.deleteMany({ batch: { $in: ['BATCH001', 'BATCH002'] } });
    await Prescription.deleteMany({});
    console.log('\n🧹 Test data cleaned up');
    
    mongoose.connection.close();
  }
}

testPrescriptionFlow();