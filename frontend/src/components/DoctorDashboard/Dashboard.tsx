import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, Tent, Pill, AlertTriangle } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  type: "clinic" | "camp";
}

interface Medicine {
  id: string;
  name: string;
  batch: string;
  expiryDate: string;
  type: 'clinic' | 'camp' | 'others';
}

interface DashboardProps {
  patients: Patient[];
  clinicPatients: Patient[];
  campPatients: Patient[];
  medicines: Medicine[];
  expiringMedicines: Medicine[];
  setActiveTab: (tab: string) => void;
  setPatientView: (view: "recent" | "all") => void;
  setExpiryFilter: (filter: "all" | "expiring") => void;
  setSelectedPatient: (patient: Patient) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  patients,
  clinicPatients,
  campPatients,
  medicines,
  expiringMedicines,
  setActiveTab,
  setPatientView,
  setExpiryFilter,
  setSelectedPatient
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-primary" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Total Patients</p>
                <p className="text-xl font-bold">{patients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Clinic Patients</p>
                <p className="text-xl font-bold">{clinicPatients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Tent className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Camp Patients</p>
                <p className="text-xl font-bold">{campPatients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Pill className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Total Medicines</p>
                <p className="text-xl font-bold">{medicines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-xl font-bold">{expiringMedicines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Patients</h3>
            <Button variant="outline" size="sm" onClick={() => { setActiveTab("patients"); setPatientView("all"); }}>
              View All
            </Button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {patients.slice(0, 8).map((patient) => (
              <div key={patient.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer"
                   onClick={() => setSelectedPatient(patient)}>
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">{patient.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={patient.type === 'clinic' ? 'default' : 'secondary'}>
                    {patient.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Expiring Medicines</h3>
            <Button variant="outline" size="sm" onClick={() => { setActiveTab("inventory"); setExpiryFilter("expiring"); }}>
              View All
            </Button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {expiringMedicines.slice(0, 8).map((medicine) => (
              <div key={medicine.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium">{medicine.name}</p>
                  <p className="text-sm text-muted-foreground">Batch: {medicine.batch}</p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="text-xs">
                    {medicine.expiryDate}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{medicine.type}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
