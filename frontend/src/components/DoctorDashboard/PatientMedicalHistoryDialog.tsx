import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Phone, MapPin, Calendar, Heart, FileText, Activity } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Patient {
  id?: string;
  _id?: string;
  name?: string;
  mobile?: string;
  email?: string;
  age?: number;
  gender?: string;
  address?: string;
  medicalHistory?: string;
  lastVisit?: string;
  nextAppointment?: string;
  bloodGroup?: string;
  type?: "clinic" | "camp";
  campId?: string;
  visitHistory?: any[];
  prescriptions?: any[];
}

interface PatientMedicalHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

const PatientMedicalHistoryDialog: React.FC<PatientMedicalHistoryDialogProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  if (!patient) return null;

  // Safe getters for patient properties
  const safeAge = typeof patient.age === 'number' ? patient.age : parseInt(String(patient.age)) || 0;
  const safeGender = patient.gender || 'Not specified';
  const safeName = patient.name || 'Unknown Patient';
  const safeMobile = patient.mobile || 'No phone';
  const safeAddress = patient.address || 'No address';
  const safeType = patient.type || 'clinic';

  const getGenderColor = (gender: string) => {
    const genderLower = (gender || '').toLowerCase();
    return genderLower === 'male' 
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-pink-100 text-pink-800 border-pink-200';
  };

  const getTypeColor = (type: string) => {
    return type === 'clinic'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-purple-100 text-purple-800 border-purple-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {safeName} - Medical History
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Patient Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{safeName}</span>
                    <Badge className={getGenderColor(safeGender)}>
                      {safeAge}Y {safeGender}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{safeMobile}</span>
                  </div>
                  
                  {patient.email && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{patient.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{safeAddress}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Last Visit: {formatDate(patient.lastVisit || '')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(safeType)}>
                      {safeType === 'clinic' ? 'Clinic Patient' : 'Camp Patient'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {patient.bloodGroup && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Blood Group: {patient.bloodGroup}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  {patient.medicalHistory ? (
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-2">Patient's Medical History:</p>
                      <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                        {patient.medicalHistory}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-blue-600">No medical history recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5" />
                Patient Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-medium text-green-700 mb-1">Patient Type</p>
                  <p className="text-sm font-semibold text-green-800 capitalize">{safeType}</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-medium text-blue-700 mb-1">Age Group</p>
                  <p className="text-sm font-semibold text-blue-800">
                    {safeAge < 18 ? 'Minor' : safeAge < 60 ? 'Adult' : 'Senior'}
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs font-medium text-purple-700 mb-1">Contact</p>
                  <p className="text-sm font-semibold text-purple-800">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientMedicalHistoryDialog;