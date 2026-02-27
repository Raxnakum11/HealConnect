import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Phone, MapPin, Calendar, User, FileText, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import PatientMedicalHistoryDialog from './PatientMedicalHistoryDialog';

interface Camp {
  id: string;
  title: string;
  name?: string;
  date: string;
  location: string;
  description: string;
  contactInfo: string;
  status: 'planned' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  patients?: string[];
  registeredPatients?: Patient[];
}

interface Patient {
  id: string;
  _id?: string;
  name: string;
  mobile: string;
  email?: string;
  age: number;
  gender: string;
  address: string;
  medicalHistory: string;
  lastVisit?: string;
  nextAppointment?: string;
  bloodGroup?: string;
  type: "clinic" | "camp";
  campId?: string;
  visitHistory?: any[];
  prescriptions?: any[];
}

interface CampPatientsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  camp: Camp | null;
  allPatients: Patient[];
}

const CampPatientsDialog: React.FC<CampPatientsDialogProps> = ({
  isOpen,
  onClose,
  camp,
  allPatients
}) => {
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  if (!camp) return null;

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowMedicalHistory(true);
  };

  const normalizeCampId = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return String(value.id || value._id || '');
    }
    return String(value);
  };

  // Get camp id - handle both id and _id from backend
  const campId = normalizeCampId(camp.id) || normalizeCampId((camp as any)._id);

  // Get genuinely registered camp patients only
  const registeredPatients = (allPatients || []).filter((patient) => {
    if (!patient || patient.type !== 'camp') return false;
    const patientCampId = normalizeCampId(patient.campId);
    return patientCampId && campId && patientCampId === campId;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {camp.title || camp.name || 'Camp Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Camp Information */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(camp.date || '')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{camp.location || 'Unknown location'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{camp.contactInfo || 'No contact info'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(camp.status || 'scheduled')}>
                      {(camp.status || 'scheduled').charAt(0).toUpperCase() + (camp.status || 'scheduled').slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 inline mr-1" />
                    {camp.description || 'No description available'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registered Patients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Registered Patients ({registeredPatients.length})
              </h3>
            </div>

            {registeredPatients.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No patients registered for this camp yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registeredPatients.map((patient, index) => (
                  <Card key={patient.id || patient._id || index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <h4 
                            className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors flex items-center gap-1"
                            onClick={() => handlePatientClick(patient)}
                            title="Click to view medical history"
                          >
                            {patient.name || 'Unknown Patient'}
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </h4>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {patient.age || '?'}Y {patient.gender || ''}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{patient.mobile || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{patient.address || 'No address'}</span>
                        </div>
                        {patient.bloodGroup && (
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                            <span>{patient.bloodGroup}</span>
                          </div>
                        )}
                        {patient.lastVisit && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Last visit: {formatDate(patient.lastVisit)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>

      {/* Patient Medical History Dialog */}
      <PatientMedicalHistoryDialog
        isOpen={showMedicalHistory}
        onClose={() => setShowMedicalHistory(false)}
        patient={selectedPatient}
      />
    </Dialog>
  );
};

export default CampPatientsDialog;