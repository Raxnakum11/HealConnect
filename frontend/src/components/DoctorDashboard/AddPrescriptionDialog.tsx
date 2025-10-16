import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Patient {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  age: number;
  gender: string;
  address: string;
  medicalHistory: string;
  lastVisit?: string;
  nextAppointment?: string;
  type: "clinic" | "camp";
  campId?: string;
  visitHistory?: any[];
  prescriptions?: any[];
}

interface PrescriptionMedicine {
  medicineId: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing: string;
  quantityGiven: number;
  instructions: string;
}

interface Medicine {
  _id: string;
  name: string;
  size: string;
  unit: string;
  quantity: number;
  type: 'clinic' | 'camp' | 'others';
  batch: string;
  expiryDate: string;
}

interface AddPrescriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPatient: Patient | null;
  onSuccess?: () => void;
}

export default function AddPrescriptionDialog({
  isOpen,
  onOpenChange,
  selectedPatient,
  onSuccess
}: AddPrescriptionDialogProps) {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symptoms: '',
    diagnosis: '',
    instructions: '',
    nextVisitDate: '',
    prescribedMedicines: [] as PrescriptionMedicine[]
  });

  // Load medicines on component mount
  useEffect(() => {
    if (isOpen) {
      loadMedicines();
      // Reset form when dialog opens
      setFormData({
        symptoms: '',
        diagnosis: '',
        instructions: '',
        nextVisitDate: '',
        prescribedMedicines: [{
          medicineId: '',
          name: '',
          dosage: '',
          frequency: 'Twice daily',
          duration: '',
          timing: 'After meals',
          quantityGiven: 1,
          instructions: ''
        }]
      });
    }
  }, [isOpen]);

  const loadMedicines = async () => {
    try {
      const response = await api.medicines.getMedicines();
      setMedicines(response || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load medicines inventory",
        variant: "destructive"
      });
    }
  };
  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      prescribedMedicines: [...prev.prescribedMedicines, {
        medicineId: '',
        name: '',
        dosage: '',
        frequency: 'Twice daily',
        duration: '',
        timing: 'After meals',
        quantityGiven: 1,
        instructions: ''
      }]
    }));
  };

  const removeMedicine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prescribedMedicines: prev.prescribedMedicines.filter((_, i) => i !== index)
    }));
  };

  const updateMedicine = (index: number, field: keyof PrescriptionMedicine, value: any) => {
    setFormData(prev => ({
      ...prev,
      prescribedMedicines: prev.prescribedMedicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return;

    // Validate form
    if (!formData.symptoms.trim() || !formData.diagnosis.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in symptoms and diagnosis",
        variant: "destructive"
      });
      return;
    }

    if (formData.prescribedMedicines.length === 0 || formData.prescribedMedicines.some(med => !med.medicineId)) {
      toast({
        title: "Missing Medicine",
        description: "Please select at least one medicine",
        variant: "destructive"
      });
      return;
    }

    // Validate selectedPatient
    if (!selectedPatient || !selectedPatient.id) {
      toast({
        title: "Error",
        description: "No patient selected. Please select a patient first.",
        variant: "destructive"
      });
      return;
    }

    // Check if patient ID is valid (should be 24 hex characters for MongoDB ObjectId)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(selectedPatient.id);
    if (!isValidObjectId) {
      console.error('🔥 Invalid patient ID detected:', selectedPatient.id);
      console.error('🔥 Selected patient object:', selectedPatient);
      
      toast({
        title: "Cannot Create Prescription - Invalid Patient",
        description: `The selected patient has an invalid ID (${selectedPatient.id}). This usually means the app is using sample data instead of real database patients. Please check your internet connection and refresh the page to load real patient data.`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const prescriptionData = {
        patientId: selectedPatient.id,
        campId: selectedPatient.campId || null,
        visitId: `visit_${Date.now()}`, // Generate visit ID
        medicines: formData.prescribedMedicines.map(med => ({
          medicineId: med.medicineId,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          timing: med.timing,
          quantityGiven: med.quantityGiven,
          instructions: med.instructions
        })),
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        additionalNotes: formData.instructions,
        followUpDate: formData.nextVisitDate ? new Date(formData.nextVisitDate) : null
      };

      console.log('🔥 Creating prescription with data:', prescriptionData);
      console.log('🔥 Patient details:', {
        id: selectedPatient.id,
        name: selectedPatient.name,
        mobile: selectedPatient.mobile
      });

      const result = await api.prescriptions.createPrescription(prescriptionData);
      console.log('🔥 Prescription created successfully:', result);
      
      toast({
        title: "Success",
        description: "Prescription created successfully"
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Prescription creation error:', error);
      let errorMessage = "Failed to create prescription";
      
      if (error.response?.data?.details) {
        errorMessage = error.response.data.details;
      } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map((err: any) => `${err.field}: ${err.message}`).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!loading) {
      onOpenChange(open);
    }
  };

  const preventFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Prescription for {selectedPatient?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={preventFormSubmit} className="space-y-6">
          {/* Patient Symptoms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Symptoms *</Label>
              <Textarea 
                value={formData.symptoms}
                onChange={(e) => {
                  e.stopPropagation();
                  setFormData(prev => ({ ...prev, symptoms: e.target.value }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                placeholder="Enter patient symptoms"
                rows={3}
              />
            </div>
            <div>
              <Label>Diagnosis *</Label>
              <Textarea 
                value={formData.diagnosis}
                onChange={(e) => {
                  e.stopPropagation();
                  setFormData(prev => ({ ...prev, diagnosis: e.target.value }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                placeholder="Enter diagnosis"
                rows={3}
              />
            </div>
          </div>

          {/* Medicines */}
          <div>
            <Label className="text-lg font-semibold">Medicines</Label>
            {formData.prescribedMedicines.map((medicine, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-3 p-4 border rounded-lg">
                <div>
                  <Label className="text-xs">Medicine</Label>
                  <Select
                    value={medicine.medicineId}
                    onValueChange={(value) => {
                      const selected = medicines.find(m => m._id === value);
                      updateMedicine(index, 'medicineId', value);
                      updateMedicine(index, 'name', selected ? `${selected.name} ${selected.size}${selected.unit}` : '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {medicines.map(med => (
                        <SelectItem key={med._id} value={med._id}>
                          {med.name} {med.size}{med.unit} (Qty: {med.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Dosage</Label>
                  <Input 
                    placeholder="Dosage"
                    value={medicine.dosage}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateMedicine(index, 'dosage', e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Frequency</Label>
                  <Select
                    value={medicine.frequency}
                    onValueChange={(value) => updateMedicine(index, 'frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once daily">Once daily</SelectItem>
                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                      <SelectItem value="Thrice daily">Thrice daily</SelectItem>
                      <SelectItem value="Four times daily">Four times daily</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Duration</Label>
                  <Input 
                    placeholder="Duration"
                    value={medicine.duration}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateMedicine(index, 'duration', e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Timing</Label>
                  <Select
                    value={medicine.timing}
                    onValueChange={(value) => updateMedicine(index, 'timing', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Before meals">Before meals</SelectItem>
                      <SelectItem value="After meals">After meals</SelectItem>
                      <SelectItem value="With meals">With meals</SelectItem>
                      <SelectItem value="Empty stomach">Empty stomach</SelectItem>
                      <SelectItem value="At bedtime">At bedtime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Quantity</Label>
                  <Input 
                    type="number"
                    min="1"
                    value={medicine.quantityGiven}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateMedicine(index, 'quantityGiven', parseInt(e.target.value) || 1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  />
                </div>
                <div className="flex items-end">
                  {formData.prescribedMedicines.length > 1 && (
                    <Button 
                      type="button"
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeMedicine(index);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addMedicine();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </div>

          {/* Additional Instructions */}
          <div>
            <Label>Additional Instructions</Label>
            <Textarea 
              value={formData.instructions}
              onChange={(e) => {
                e.stopPropagation();
                setFormData(prev => ({ ...prev, instructions: e.target.value }));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              placeholder="Enter additional prescription instructions"
              rows={3}
            />
          </div>

          {/* Next Visit Date */}
          <div>
            <Label>Next Visit Date</Label>
            <Input 
              type="date"
              value={formData.nextVisitDate}
              onChange={(e) => {
                e.stopPropagation();
                setFormData(prev => ({ ...prev, nextVisitDate: e.target.value }));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            />
          </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleDialogClose(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Add Prescription'}
          </Button>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
