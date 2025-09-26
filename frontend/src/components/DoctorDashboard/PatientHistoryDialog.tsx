import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VisitRecord {
  id: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  prescription: string;
  nextVisit?: string;
  notes: string;
}

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
  visitHistory?: VisitRecord[];
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
                <div className="col-span-2"><strong>Address:</strong> {selectedPatient.address}</div>
                <div className="col-span-2"><strong>Type:</strong> {selectedPatient.type}</div>
              </div>
            </Card>

            <div>
              <h3 className="font-semibold mb-3">Visit History ({selectedPatient.visitHistory?.length || 0} visits)</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedPatient.visitHistory?.map((visit) => (
                  <Card key={visit.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Visit - {visit.date}</h4>
                      {visit.nextVisit && (
                        <Badge variant="outline">Next: {visit.nextVisit}</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><strong>Symptoms:</strong> {visit.symptoms}</div>
                      <div><strong>Diagnosis:</strong> {visit.diagnosis}</div>
                      {/* Homeopathy: show only notes and next follow-up, hide medicine names */}
                      {doctorSpecialization === 'homeopathy' ? (
                        <>
                          {visit.notes && (
                            <div className="md:col-span-2"><strong>Doctor's Notes:</strong> {visit.notes}</div>
                          )}
                        </>
                      ) : doctorSpecialization === 'allopathy' ? (
                        <>
                          <div className="md:col-span-2"><strong>Prescribed Medicines:</strong> {visit.prescription}</div>
                          {visit.notes && (
                            <div className="md:col-span-2"><strong>Other Notes:</strong> {visit.notes}</div>
                          )}
                        </>
                      ) : (
                        <div className="md:col-span-2"><strong>Prescription:</strong> {visit.prescription}</div>
                      )}
                    </div>
                  </Card>
                )) || (
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
