import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  mobile: string;
  age: number;
  gender: string;
  address: string;
  medicalHistory: string;
  lastVisit: string;
  nextAppointment?: string;
  type: "clinic" | "camp";
  campId?: string;
}

interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  inventoryId: string;
  inventoryType: 'clinic' | 'camp' | 'others';
}

interface AddPrescriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPatient: Patient | null;
  newPrescription: {
    medicines: PrescriptionMedicine[];
    instructions: string;
    nextVisit: string;
  };
  setNewPrescription: React.Dispatch<React.SetStateAction<{
    medicines: PrescriptionMedicine[];
    instructions: string;
    nextVisit: string;
  }>>;
  onAddPrescription: () => void;
}

// Example inventory medicines (replace with actual inventory from props or context)
const inventoryMedicines = [
  { id: 'inv1', name: 'Paracetamol', size: '500', unit: 'mg', type: 'clinic' },
  { id: 'inv2', name: 'Amoxicillin', size: '250', unit: 'mg', type: 'camp' },
  { id: 'inv3', name: 'Cetirizine', size: '10', unit: 'mg', type: 'others' },
  { id: 'inv4', name: 'Ibuprofen', size: '200', unit: 'mg', type: 'clinic' },
  { id: 'inv5', name: 'Azithromycin', size: '500', unit: 'mg', type: 'camp' }
];

export default function AddPrescriptionDialog({
  isOpen,
  onOpenChange,
  selectedPatient,
  newPrescription,
  setNewPrescription,
  onAddPrescription
}: AddPrescriptionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Prescription for {selectedPatient?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Medicines</Label>
            {newPrescription.medicines.map((medicine, index) => {
              // Filter medicines by selected inventory type
              const filteredInventory = inventoryMedicines.filter(invMed => {
                if (!medicine.inventoryType) return true;
                return (invMed.type === medicine.inventoryType);
              });
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2 p-3 border rounded-lg">
                  <Select
                    value={medicine.inventoryType}
                    onValueChange={(value) => {
                      const updated = [...newPrescription.medicines];
                      updated[index].inventoryType = value as 'clinic' | 'camp' | 'others';
                      updated[index].inventoryId = '';
                      setNewPrescription(prev => ({ ...prev, medicines: updated }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select inventory type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinic">Clinic Inventory</SelectItem>
                      <SelectItem value="camp">Camp Inventory</SelectItem>
                      <SelectItem value="others">Others Inventory</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={medicine.inventoryId}
                    onValueChange={(value) => {
                      const selected = filteredInventory.find(m => m.id === value);
                      const updated = [...newPrescription.medicines];
                      updated[index].inventoryId = value;
                      updated[index].name = selected ? `${selected.name} ${selected.size}${selected.unit}` : '';
                      setNewPrescription(prev => ({ ...prev, medicines: updated }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select medicine from inventory" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredInventory.map(invMed => (
                        <SelectItem key={invMed.id} value={invMed.id}>{invMed.name} {invMed.size}{invMed.unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    placeholder="Dosage"
                    value={medicine.dosage}
                    onChange={(e) => {
                      const updated = [...newPrescription.medicines];
                      updated[index].dosage = e.target.value;
                      setNewPrescription(prev => ({ ...prev, medicines: updated }));
                    }}
                  />
                  <Input 
                    placeholder="Frequency"
                    value={medicine.frequency}
                    onChange={(e) => {
                      const updated = [...newPrescription.medicines];
                      updated[index].frequency = e.target.value;
                      setNewPrescription(prev => ({ ...prev, medicines: updated }));
                    }}
                  />
                  <Input 
                    placeholder="Duration"
                    value={medicine.duration}
                    onChange={(e) => {
                      const updated = [...newPrescription.medicines];
                      updated[index].duration = e.target.value;
                      setNewPrescription(prev => ({ ...prev, medicines: updated }));
                    }}
                  />
                  {index > 0 && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const updated = newPrescription.medicines.filter((_, i) => i !== index);
                        setNewPrescription(prev => ({ ...prev, medicines: updated }));
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
            <Button 
              variant="outline" 
              onClick={() => {
                setNewPrescription(prev => ({ 
                  ...prev, 
                  medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', inventoryId: '', inventoryType: 'clinic' }]
                }));
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </div>
          <div>
            <Label>Instructions</Label>
            <Textarea 
              value={newPrescription.instructions} 
              onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="Enter prescription instructions"
            />
          </div>
          <div>
            <Label>Next Visit Date</Label>
            <Input 
              type="date"
              value={newPrescription.nextVisit} 
              onChange={(e) => setNewPrescription(prev => ({ ...prev, nextVisit: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onAddPrescription}>Add Prescription</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
