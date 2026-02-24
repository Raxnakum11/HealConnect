import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileEdit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Camp {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  contactInfo: string;
  status: 'planned' | 'ongoing' | 'completed';
  patients: string[];
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
  visitHistory?: {
    id: string;
    date: string;
    symptoms: string;
    diagnosis: string;
    prescription: string;
    notes: string;
  }[];
  prescriptions?: any[];
}

interface PatientsProps {
  patients: Patient[];
  clinicPatients: Patient[];
  campPatients: Patient[];
  camps: Camp[];
  patientView: "recent" | "all";
  setPatientView: (view: "recent" | "all") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSelectedPatient: (patient: Patient) => void;
  setShowPatientHistory: (show: boolean) => void;
  setShowPrescriptionDialog: (show: boolean) => void;
  removePatient: (id: string) => Promise<void>;
  setShowPatientDialog: (show: boolean) => void;
}

const Patients: React.FC<PatientsProps> = ({
  patients,
  clinicPatients,
  campPatients,
  camps,
  patientView,
  setPatientView,
  searchTerm,
  setSearchTerm,
  setSelectedPatient,
  setShowPatientHistory,
  setShowPrescriptionDialog,
  removePatient,
  setShowPatientDialog
}) => {
  const handleDeletePatient = async (patientId: string) => {
    const patient = [...clinicPatients, ...campPatients].find(p => p.id === patientId);
    const patientName = patient?.name || 'this patient';
    
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${patientName}"?\n\nThis action cannot be undone and will permanently remove the patient from the database.`
    );
    
    if (isConfirmed) {
      await removePatient(patientId);
    }
  };
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Patient Management</h2>
        <div className="flex flex-wrap gap-2">
          <Select value={patientView} onValueChange={(value: "recent" | "all") => setPatientView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="all">All Patients</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowPatientDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search patients by name, ID, or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <Tabs defaultValue="clinic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clinic">Clinic Patients ({clinicPatients.length})</TabsTrigger>
          <TabsTrigger value="camp">Camp Patients ({campPatients.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clinic">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {clinicPatients.map((patient) => (
              <Card key={patient.id} className="cursor-pointer hover:shadow-lg transition-all group">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div onClick={() => { setSelectedPatient(patient); setShowPatientHistory(true); }}>
                      <h3 className="font-semibold text-sm group-hover:text-primary">{patient.name}</h3>
                      <p className="text-xs text-muted-foreground">ID: {patient.id}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedPatient(patient); setShowPrescriptionDialog(true); }} className="h-6 w-6 p-0">
                        <FileEdit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeletePatient(patient.id)} className="h-6 w-6 p-0">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Badge variant="outline" className="text-xs">{patient.age}y {patient.gender}</Badge>
                      <Badge variant="default" className="text-xs">Clinic</Badge>
                    </div>
                    <p className="text-xs"><strong>Mobile:</strong> {patient.mobile}</p>
                    <p className="text-xs"><strong>Last Visit:</strong> {formatDate(patient.lastVisit)}</p>
                    <p className="text-xs"><strong>Visits:</strong> {patient.visitHistory?.length || 0}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="camp">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {campPatients.map((patient) => (
              <Card key={patient.id} className="cursor-pointer hover:shadow-lg transition-all group">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div onClick={() => { setSelectedPatient(patient); setShowPatientHistory(true); }}>
                      <h3 className="font-semibold text-sm group-hover:text-primary">{patient.name}</h3>
                      <p className="text-xs text-muted-foreground">ID: {patient.id}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedPatient(patient); setShowPrescriptionDialog(true); }} className="h-6 w-6 p-0">
                        <FileEdit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeletePatient(patient.id)} className="h-6 w-6 p-0">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Badge variant="outline" className="text-xs">{patient.age}y {patient.gender}</Badge>
                      <Badge variant="secondary" className="text-xs">Camp</Badge>
                    </div>
                    <p className="text-xs"><strong>Mobile:</strong> {patient.mobile}</p>
                    <p className="text-xs"><strong>Last Visit:</strong> {formatDate(patient.lastVisit)}</p>
                    <p className="text-xs"><strong>Visits:</strong> {patient.visitHistory?.length || 0}</p>
                    {patient.campId && (
                      <p className="text-xs"><strong>Camp:</strong> {patient.campId}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Patients;
