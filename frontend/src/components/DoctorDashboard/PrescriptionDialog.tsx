// Add this function to handle inventory reduction after the handleSubmit function
const updateMedicineInventory = async (medicines: PrescriptionMedicine[]) => {
  for (const medicine of medicines) {
    try {
      // Find the medicine in inventory
      const inventoryMedicine = availableMedicines.find(m => m.id === medicine.medicineId);
      if (inventoryMedicine && inventoryMedicine.quantity >= medicine.quantity) {
        // Calculate new quantity
        const newQuantity = inventoryMedicine.quantity - medicine.quantity;
        
        // Update the medicine quantity in database
        await api.medicines.updateMedicine(medicine.medicineId, {
          ...inventoryMedicine,
          quantity: newQuantity
        });
        
        console.log(`Updated ${inventoryMedicine.name}: ${inventoryMedicine.quantity} -> ${newQuantity}`);
      } else {
        console.warn(`Insufficient stock for ${medicine.medicineName}. Available: ${inventoryMedicine?.quantity || 0}, Required: ${medicine.quantity}`);
      }
    } catch (error) {
      console.error(`Failed to update inventory for ${medicine.medicineName}:`, error);
    }
  }
};

// Update the handleSubmit function to include inventory reduction
const handleSubmit = async () => {
  if (!patient || medicines.length === 0) {
    toast({
      title: "Error",
      description: "Please add at least one medicine to the prescription.",
      variant: "destructive",
    });
    return;
  }

  try {
    const prescriptionData = {
      patientId: patient.id,
      medicines: medicines.map(med => ({
        medicineId: med.medicineId,
        medicineName: med.medicineName,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        quantity: med.quantity
      })),
      instructions,
      nextVisitDate: nextVisit || undefined,
    };

    // Create the prescription
    await onAddPrescription(prescriptionData);
    
    // Update medicine inventory
    await updateMedicineInventory(medicines);
    
    // Reset form
    setMedicines([]);
    setInstructions('');
    setNextVisit('');
    
    toast({
      title: "Success",
      description: "Prescription created successfully and inventory updated.",
    });
    
    onClose();
  } catch (error) {
    console.error('Error creating prescription:', error);
    toast({
      title: "Error",
      description: "Failed to create prescription. Please try again.",
      variant: "destructive",
    });
  }
};