// Database Integrity Checker
// This script validates all MongoDB collections and their relationships

const mongoose = require('mongoose');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Medicine = require('./src/models/Medicine');
const Camp = require('./src/models/Camp');
const Prescription = require('./src/models/Prescription');
const Appointment = require('./src/models/Appointment');

class DatabaseValidator {
    constructor() {
        this.results = {
            collections: {},
            relationships: {},
            issues: [],
            summary: {
                totalCollections: 0,
                totalDocuments: 0,
                relationshipIssues: 0
            }
        };
    }

    async connectToDatabase() {
        try {
            await mongoose.connect('mongodb://localhost:27017/healconnect_db');
            console.log('✅ Connected to MongoDB successfully');
            return true;
        } catch (error) {
            console.log('❌ Failed to connect to MongoDB:', error.message);
            return false;
        }
    }

    async checkCollection(model, name) {
        try {
            const count = await model.countDocuments();
            const sampleDoc = await model.findOne();
            
            this.results.collections[name] = {
                count,
                hasData: count > 0,
                sampleStructure: sampleDoc ? Object.keys(sampleDoc.toObject()) : []
            };

            console.log(`📊 ${name}: ${count} documents`);
            if (sampleDoc) {
                console.log(`   Sample fields: ${Object.keys(sampleDoc.toObject()).join(', ')}`);
            }

            this.results.summary.totalDocuments += count;
            this.results.summary.totalCollections++;

            return { count, sampleDoc };
        } catch (error) {
            console.log(`❌ Error checking ${name}:`, error.message);
            this.results.issues.push({
                type: 'collection_error',
                collection: name,
                error: error.message
            });
            return { count: 0, sampleDoc: null };
        }
    }

    async validateRelationships() {
        console.log('\n🔗 Validating Relationships...');

        // Check User-Patient linking
        try {
            const users = await User.find();
            const patients = await Patient.find();

            console.log(`\n👥 User-Patient Relationships:`);
            
            for (const user of users) {
                if (user.role === 'patient') {
                    // Find corresponding patient record
                    const patientRecord = patients.find(p => 
                        p.email === user.email || 
                        p.mobile === user.mobile ||
                        p.userId?.toString() === user._id.toString()
                    );

                    if (patientRecord) {
                        console.log(`✅ User ${user.name} (${user.email}) has patient record`);
                    } else {
                        console.log(`⚠️  User ${user.name} (${user.email}) missing patient record`);
                        this.results.issues.push({
                            type: 'missing_patient_record',
                            user: user.name,
                            email: user.email
                        });
                        this.results.summary.relationshipIssues++;
                    }
                }
            }

            // Check orphaned patients
            for (const patient of patients) {
                const userRecord = users.find(u => 
                    u.email === patient.email || 
                    u.mobile === patient.mobile ||
                    u._id.toString() === patient.userId?.toString()
                );

                if (!userRecord) {
                    console.log(`⚠️  Patient ${patient.name} (${patient.email}) has no user account`);
                    this.results.issues.push({
                        type: 'orphaned_patient',
                        patient: patient.name,
                        email: patient.email
                    });
                    this.results.summary.relationshipIssues++;
                }
            }

        } catch (error) {
            console.log(`❌ Error validating user-patient relationships:`, error.message);
        }

        // Check Prescription relationships
        try {
            const prescriptions = await Prescription.find();
            const medicines = await Medicine.find();

            console.log(`\n💊 Prescription-Medicine Relationships:`);
            
            for (const prescription of prescriptions) {
                // Check if prescribed medicines exist
                if (prescription.medicines && prescription.medicines.length > 0) {
                    for (const prescribedMed of prescription.medicines) {
                        const medicineExists = medicines.find(m => 
                            m._id.toString() === prescribedMed.medicine?.toString() ||
                            m.name === prescribedMed.name
                        );

                        if (!medicineExists) {
                            console.log(`⚠️  Prescription references non-existent medicine: ${prescribedMed.name || prescribedMed.medicine}`);
                            this.results.issues.push({
                                type: 'invalid_medicine_reference',
                                prescription: prescription._id,
                                medicine: prescribedMed.name || prescribedMed.medicine
                            });
                            this.results.summary.relationshipIssues++;
                        }
                    }
                } else {
                    console.log(`⚠️  Prescription ${prescription._id} has no medicines`);
                }

                // Check if patient exists
                if (prescription.patient) {
                    const patientExists = await Patient.findById(prescription.patient);
                    if (!patientExists) {
                        console.log(`⚠️  Prescription references non-existent patient: ${prescription.patient}`);
                        this.results.issues.push({
                            type: 'invalid_patient_reference',
                            prescription: prescription._id,
                            patient: prescription.patient
                        });
                        this.results.summary.relationshipIssues++;
                    }
                }
            }

        } catch (error) {
            console.log(`❌ Error validating prescription relationships:`, error.message);
        }

        // Check Camp relationships
        try {
            const camps = await Camp.find();
            console.log(`\n🏕️  Camp Data Validation:`);
            
            for (const camp of camps) {
                // Check if camp has valid date
                if (camp.date && new Date(camp.date) < new Date()) {
                    console.log(`⚠️  Camp "${camp.name}" has past date: ${camp.date}`);
                }

                // Check if camp has patients assigned
                if (camp.patients && camp.patients.length > 0) {
                    console.log(`✅ Camp "${camp.name}" has ${camp.patients.length} patients assigned`);
                } else {
                    console.log(`ℹ️  Camp "${camp.name}" has no patients assigned yet`);
                }
            }

        } catch (error) {
            console.log(`❌ Error validating camp data:`, error.message);
        }
    }

    async checkAppointments() {
        try {
            const appointments = await Appointment.find();
            console.log(`\n📅 Appointment Validation:`);
            
            for (const appointment of appointments) {
                // Check if patient exists
                if (appointment.patient) {
                    const patientExists = await Patient.findById(appointment.patient);
                    if (!patientExists) {
                        console.log(`⚠️  Appointment references non-existent patient: ${appointment.patient}`);
                        this.results.issues.push({
                            type: 'invalid_appointment_patient',
                            appointment: appointment._id,
                            patient: appointment.patient
                        });
                        this.results.summary.relationshipIssues++;
                    }
                }

                // Check appointment date validity
                if (appointment.date && new Date(appointment.date) < new Date()) {
                    console.log(`ℹ️  Appointment ${appointment._id} is in the past: ${appointment.date}`);
                }
            }

        } catch (error) {
            console.log(`❌ Error validating appointments:`, error.message);
        }
    }

    async runFullValidation() {
        console.log('🔍 Starting Database Integrity Validation...\n');
        console.log('=' .repeat(60));

        const connected = await this.connectToDatabase();
        if (!connected) return;

        // Check all collections
        console.log('\n📊 Collection Analysis:');
        await this.checkCollection(User, 'Users');
        await this.checkCollection(Patient, 'Patients');
        await this.checkCollection(Medicine, 'Medicines');
        await this.checkCollection(Camp, 'Camps');
        await this.checkCollection(Prescription, 'Prescriptions');
        await this.checkCollection(Appointment, 'Appointments');

        // Validate relationships
        await this.validateRelationships();
        await this.checkAppointments();

        // Print summary
        console.log('\n' + '=' .repeat(60));
        console.log('📋 DATABASE INTEGRITY SUMMARY');
        console.log('=' .repeat(60));
        console.log(`📊 Total Collections: ${this.results.summary.totalCollections}`);
        console.log(`📄 Total Documents: ${this.results.summary.totalDocuments}`);
        console.log(`⚠️  Relationship Issues: ${this.results.summary.relationshipIssues}`);

        if (this.results.issues.length > 0) {
            console.log('\n🚨 Issues Found:');
            this.results.issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue.type}: ${JSON.stringify(issue, null, 2)}`);
            });
        } else {
            console.log('\n✅ No data integrity issues found!');
        }

        console.log('\n🏁 Database validation complete!');
        
        await mongoose.disconnect();
        return this.results;
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new DatabaseValidator();
    validator.runFullValidation().catch(console.error);
}

module.exports = DatabaseValidator;