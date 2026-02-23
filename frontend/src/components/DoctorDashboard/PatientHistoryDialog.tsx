import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface VisitRecord {
  _id: string;
  date: string;
  doctorId: string;
  doctorName: string;
  symptoms: string;
  diagnosis: string;
  prescriptionId?: string;
  prescribedMedicines: Array<{
    medicineId: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantityGiven: number;
  }>;
  instructions: string;
  nextVisitDate?: string;
  notes: string;
  campId?: string;
}

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
  visitHistory?: VisitRecord[];
  prescriptions?: any[];
}

interface PatientHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPatient: Patient | null;
  doctorSpecialization?: string;
}

export default function PatientHistoryDialog({
  isOpen,
  onOpenChange,
  selectedPatient,
  doctorSpecialization
}: PatientHistoryDialogProps) {
  const { toast } = useToast();
  const [visitHistory, setVisitHistory] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && selectedPatient) {
      loadVisitHistory();
    }
  }, [isOpen, selectedPatient]);

  const loadVisitHistory = async () => {
    if (!selectedPatient) return;
    
    setLoading(true);
    try {
      const response = await api.patients.getPatientVisitHistory(selectedPatient.id);
      setVisitHistory(response.visitHistory || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load visit history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient History - {selectedPatient?.name}</DialogTitle>
        </DialogHeader>
        {selectedPatient && (
          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Patient Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><strong>ID:</strong> {selectedPatient.id}</div>
                <div><strong>Age:</strong> {selectedPatient.age} years</div>
                <div><strong>Gender:</strong> {selectedPatient.gender}</div>
                <div><strong>Mobile:</strong> {selectedPatient.mobile}</div>
                <div className="col-span-2"><strong>Address:</strong> {selectedPatient.address || 'Not provided'}</div>
                <div className="col-span-2"><strong>Type:</strong> {selectedPatient.type}</div>
              </div>
            </Card>

            <div>
              <h3 className="font-semibold mb-3">Visit History ({visitHistory.length} visits)</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <p className="text-center py-8">Loading visit history...</p>
                ) : visitHistory.length > 0 ? (
                  visitHistory.map((visit) => {
                    const normalizedDoctorName = (visit.doctorName || '').trim();
                    const displayDoctorName =
                      normalizedDoctorName && !/^undefined(\s+undefined)?$/i.test(normalizedDoctorName)
                        ? normalizedDoctorName
                        : 'Dr. Himanshu Sonagara';

                    return (
                      <Card key={visit._id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Visit - {formatDate(visit.date)}</h4>
                          {visit.nextVisitDate && (
                            <Badge variant="outline">Next: {formatDate(visit.nextVisitDate)}</Badge>
                          )}
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><strong>Doctor:</strong> {displayDoctorName}</div>
                            <div><strong>Symptoms:</strong> {visit.symptoms}</div>
                            <div><strong>Diagnosis:</strong> {visit.diagnosis}</div>
                            {visit.instructions && (
                              <div><strong>Instructions:</strong> {visit.instructions}</div>
                            )}
                          </div>

                          {visit.prescribedMedicines && visit.prescribedMedicines.length > 0 && (
                            <div>
                              <strong>Prescribed Medicines:</strong>
                              <div className="mt-2 space-y-2">
                                {visit.prescribedMedicines.map((medicine, index) => (
                                  <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                                    <span className="font-medium">{medicine.medicineName}</span>
                                    {medicine.dosage && <span> - {medicine.dosage}</span>}
                                    {medicine.frequency && <span>, {medicine.frequency}</span>}
                                    {medicine.duration && <span> for {medicine.duration}</span>}
                                    {medicine.quantityGiven && <span> (Qty: {medicine.quantityGiven})</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {visit.notes && (
                            <div><strong>Notes:</strong> {visit.notes}</div>
                          )}
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-center py-8">No visit history available</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Medical History</h3>
              <Card className="p-4">
                <p className="text-sm">{selectedPatient.medicalHistory || 'No medical history recorded'}</p>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
