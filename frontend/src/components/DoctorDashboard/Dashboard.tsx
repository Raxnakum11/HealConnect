import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, Tent, Pill, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Patient {
  id: string;
  name: string;
  mobile?: string;
  email?: string;
  age?: number;
  gender?: string;
  address?: string;
  medicalHistory?: string;
  lastVisit?: string;
  nextAppointment?: string;
  type: "clinic" | "camp";
  campId?: string;
  visitHistory?: any[];
  prescriptions?: any[];
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
      {/* Dashboard Stats Cards - Improved Mobile Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary mb-2 sm:mb-0" />
              <div className="sm:ml-3">
                <p className="text-xs font-medium text-muted-foreground">Total Patients</p>
                <p className="text-lg sm:text-xl font-bold">{patients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mb-2 sm:mb-0" />
              <div className="sm:ml-3">
                <p className="text-xs font-medium text-muted-foreground">Clinic Patients</p>
                <p className="text-lg sm:text-xl font-bold">{clinicPatients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
              <Tent className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-2 sm:mb-0" />
              <div className="sm:ml-3">
                <p className="text-xs font-medium text-muted-foreground">Camp Patients</p>
                <p className="text-lg sm:text-xl font-bold">{campPatients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
              <Pill className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mb-2 sm:mb-0" />
              <div className="sm:ml-3">
                <p className="text-xs font-medium text-muted-foreground">Total Medicines</p>
                <p className="text-lg sm:text-xl font-bold">{medicines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mb-2 sm:mb-0" />
              <div className="sm:ml-3">
                <p className="text-xs font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-lg sm:text-xl font-bold">{expiringMedicines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Content - Improved Mobile Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold">Recent Patients</h3>
            <Button variant="outline" size="sm" onClick={() => { setActiveTab("patients"); setPatientView("all"); }} className="w-full sm:w-auto">
              View All
            </Button>
          </div>
          <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
            {patients.slice(0, 8).map((patient) => (
              <div key={patient.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors gap-2"
                   onClick={() => setSelectedPatient(patient)}>
                <div className="flex-1">
                  <p className="font-medium text-sm sm:text-base">{patient.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{patient.id}</p>
                </div>
                <div className="flex items-center justify-start sm:justify-end gap-2">
                  <Badge variant={patient.type === 'clinic' ? 'default' : 'secondary'} className="text-xs">
                    {patient.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold">Expiring Medicines</h3>
            <Button variant="outline" size="sm" onClick={() => { setActiveTab("inventory"); setExpiryFilter("expiring"); }} className="w-full sm:w-auto">
              View All
            </Button>
          </div>
          <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
            {expiringMedicines.slice(0, 8).map((medicine) => (
              <div key={medicine.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-red-50 rounded-lg gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm sm:text-base">{medicine.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Batch: {medicine.batch}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-1">
                  <Badge variant="destructive" className="text-xs w-fit">
                    {formatDate(medicine.expiryDate)}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{medicine.type}</p>
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
