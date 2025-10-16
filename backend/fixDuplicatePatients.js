// Script to fix duplicate patient records
// This script identifies and merges duplicate patient records

const mongoose = require('mongoose');
const Patient = require('./src/models/Patient');

async function fixDuplicatePatients() {
    try {
        await mongoose.connect('mongodb://localhost:27017/healconnect_db');
        console.log('Connected to MongoDB');

        // Find all patients
        const allPatients = await Patient.find();
        console.log(`Total patients found: ${allPatients.length}`);

        // Group patients by name and mobile number
        const patientGroups = {};
        
        allPatients.forEach(patient => {
            const key = `${patient.name.toLowerCase()}_${patient.mobile}`;
            if (!patientGroups[key]) {
                patientGroups[key] = [];
            }
            patientGroups[key].push(patient);
        });

        // Find duplicates
        const duplicateGroups = Object.entries(patientGroups).filter(([key, patients]) => patients.length > 1);
        
        console.log(`Found ${duplicateGroups.length} duplicate groups:`);

        for (const [key, duplicates] of duplicateGroups) {
            console.log(`\n--- Duplicate Group: ${key} ---`);
            duplicates.forEach((patient, index) => {
                console.log(`${index + 1}. ID: ${patient._id}`);
                console.log(`   Name: ${patient.name}`);
                console.log(`   Mobile: ${patient.mobile}`);
                console.log(`   Email: ${patient.email || 'NO EMAIL'}`);
                console.log(`   UserID: ${patient.userId}`);
                console.log(`   Created: ${patient.createdAt}`);
            });

            // Find the best record to keep (prefer one with email, or most recent)
            let bestRecord = duplicates[0];
            let recordsToDelete = [];

            for (let i = 0; i < duplicates.length; i++) {
                const current = duplicates[i];
                
                // Prefer record with email
                if (current.email && !bestRecord.email) {
                    recordsToDelete.push(bestRecord);
                    bestRecord = current;
                } else if (!current.email && bestRecord.email) {
                    recordsToDelete.push(current);
                } else if (current.email && bestRecord.email) {
                    // Both have emails, keep the more recent one
                    if (new Date(current.createdAt) > new Date(bestRecord.createdAt)) {
                        recordsToDelete.push(bestRecord);
                        bestRecord = current;
                    } else {
                        recordsToDelete.push(current);
                    }
                } else {
                    // Neither has email, keep the more recent one
                    if (new Date(current.createdAt) > new Date(bestRecord.createdAt)) {
                        recordsToDelete.push(bestRecord);
                        bestRecord = current;
                    } else {
                        recordsToDelete.push(current);
                    }
                }
            }

            // Reset arrays if we went through all records
            if (recordsToDelete.length === duplicates.length) {
                recordsToDelete = duplicates.slice(1); // Keep first, delete rest
                bestRecord = duplicates[0];
            }

            console.log(`\n   KEEPING: ${bestRecord._id} (${bestRecord.email ? 'HAS EMAIL' : 'NO EMAIL'})`);
            console.log(`   DELETING: ${recordsToDelete.map(r => `${r._id} (${r.email ? 'HAS EMAIL' : 'NO EMAIL'})`).join(', ')}`);

            // Merge missing data from records being deleted into the best record
            for (const recordToDelete of recordsToDelete) {
                let updated = false;

                // Copy missing fields from the record being deleted
                if (!bestRecord.email && recordToDelete.email) {
                    bestRecord.email = recordToDelete.email;
                    updated = true;
                }
                if (!bestRecord.age && recordToDelete.age) {
                    bestRecord.age = recordToDelete.age;
                    updated = true;
                }
                if (!bestRecord.gender && recordToDelete.gender) {
                    bestRecord.gender = recordToDelete.gender;
                    updated = true;
                }
                if (!bestRecord.address && recordToDelete.address) {
                    bestRecord.address = recordToDelete.address;
                    updated = true;
                }
                if (!bestRecord.medicalHistory && recordToDelete.medicalHistory) {
                    bestRecord.medicalHistory = recordToDelete.medicalHistory;
                    updated = true;
                }

                if (updated) {
                    console.log(`   MERGED data from ${recordToDelete._id} into ${bestRecord._id}`);
                }
            }

            // Save the updated best record
            await bestRecord.save();
            console.log(`   UPDATED best record: ${bestRecord._id}`);

            // Delete the duplicate records
            for (const recordToDelete of recordsToDelete) {
                await Patient.findByIdAndDelete(recordToDelete._id);
                console.log(`   DELETED duplicate: ${recordToDelete._id}`);
            }
        }

        console.log('\n✅ Duplicate cleanup completed!');

        // Show final stats
        const finalPatients = await Patient.find();
        console.log(`\nFinal patient count: ${finalPatients.length}`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');

    } catch (error) {
        console.error('Error fixing duplicate patients:', error);
        process.exit(1);
    }
}

// Run the fix
if (require.main === module) {
    fixDuplicatePatients();
}

module.exports = fixDuplicatePatients;