import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout } from '@/components/Layout';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Users, 
  Pill, 
  FileText, 
  MapPin, 
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Stethoscope,
  UserPlus,
  FileEdit,
  Edit,
  Save,
  Phone,
  Mail,
  MapPinIcon,
  UserCheck,
  Building2,
  Tent,
  Package,
  Trash2,
  Eye,
  Filter,
  CalendarIcon,
  QrCode,
  Heart,
  CheckCircle,
  X,
  Download,
  Upload,
  Bell,
  Send,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NotificationService } from '@/components/NotificationService';

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
  prescriptions: Prescription[];
  type: "clinic" | "camp";
  campId?: string;
  visitHistory: VisitRecord[];
}

interface VisitRecord {
  id: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  prescription: string;
  nextVisit?: string;
  notes: string;
}

interface Prescription {
  id: string;
  patientId: string;
  medicines: PrescriptionMedicine[];
  instructions: string;
  date: string;
  nextVisit?: string;
}

interface PrescriptionMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
}

interface Medicine {
  id: string;
  name: string;
  batch: string;
  quantity: number;
  expiryDate: string;
  priority: 'high' | 'medium' | 'low';
  type: 'clinic' | 'camp' | 'others';
}

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

interface Booking {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
}

export function DoctorDashboard() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [showMedicineDialog, setShowMedicineDialog] = useState(false);
  const [showCampDialog, setShowCampDialog] = useState(false);
const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [showPatientHistory, setShowPatientHistory] = useState(false);
  const [showAddReportDialog, setShowAddReportDialog] = useState(false);
  const [showNotificationService, setShowNotificationService] = useState(false);
  const [notificationData, setNotificationData] = useState({ type: 'manual' as 'camp' | 'prescription' | 'report' | 'manual', message: '', title: '' });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [patientView, setPatientView] = useState<"recent" | "all">("recent");
  const [medicineFilter, setMedicineFilter] = useState<"all" | "clinic" | "camp" | "others">("all");
  const [expiryFilter, setExpiryFilter] = useState<"all" | "expiring">("all");

  // Form states
  const [newPatient, setNewPatient] = useState({
    name: '', mobile: '', age: '', gender: '', address: '', medicalHistory: '', type: 'clinic' as 'clinic' | 'camp', campId: ''
  });
  
  const [newMedicine, setNewMedicine] = useState({
    name: '', batch: '', quantity: '', expiryDate: '', priority: 'medium' as 'high' | 'medium' | 'low', type: 'clinic' as 'clinic' | 'camp' | 'others'
  });
  
  const [newCamp, setNewCamp] = useState({
    title: '', date: '', location: '', description: '', contactInfo: '', status: 'planned' as 'planned' | 'ongoing' | 'completed'
  });

  const [newPrescription, setNewPrescription] = useState({
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', priority: 'medium' as 'high' | 'medium' | 'low' }],
    instructions: '', nextVisit: ''
  });

  const [newReport, setNewReport] = useState({
    type: '',
    title: '',
    description: '',
    file: null as File | null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedPatients = localStorage.getItem('doctor_patients');
    const savedMedicines = localStorage.getItem('doctor_medicines');
    const savedCamps = localStorage.getItem('doctor_camps');
    const savedBookings = localStorage.getItem('doctor_bookings');

    if (savedPatients) setPatients(JSON.parse(savedPatients));
    if (savedMedicines) setMedicines(JSON.parse(savedMedicines));
    if (savedCamps) setCamps(JSON.parse(savedCamps));
    if (savedBookings) setBookings(JSON.parse(savedBookings));
  };

  const generatePatientId = (type: 'clinic' | 'camp', campLocation?: string) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const uniqueId = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    if (type === 'clinic') {
      return `CLI/${year}/${month}/${uniqueId}`;
    } else {
      const location = campLocation || 'LOC';
      return `${location.toUpperCase()}/CAMP/${year}/${month}/${uniqueId}`;
    }
  };

  const expiringMedicines = medicines.filter(medicine => {
    const today = new Date();
    const expiryDate = new Date(medicine.expiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 15 && diffDays >= 0;
  });

  const addPatient = () => {
    if (!newPatient.name || !newPatient.mobile || !newPatient.age) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const patient: Patient = {
      ...newPatient,
      id: generatePatientId(newPatient.type, newPatient.campId),
      age: parseInt(newPatient.age),
      lastVisit: new Date().toISOString().split('T')[0],
      prescriptions: [],
      visitHistory: []
    };

    const updatedPatients = [...patients, patient];
    setPatients(updatedPatients);
    localStorage.setItem('doctor_patients', JSON.stringify(updatedPatients));
    
    setShowPatientDialog(false);
    setNewPatient({ name: '', mobile: '', age: '', gender: '', address: '', medicalHistory: '', type: 'clinic', campId: '' });
    toast({ title: `${patient.type === 'clinic' ? 'Clinic' : 'Camp'} patient added successfully!`, description: `Patient ID: ${patient.id}` });
  };

  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.batch || !newMedicine.quantity || !newMedicine.expiryDate) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const medicine: Medicine = {
      ...newMedicine,
      id: `MED${Date.now()}`,
      quantity: parseInt(newMedicine.quantity)
    };

    const updatedMedicines = [...medicines, medicine];
    setMedicines(updatedMedicines);
    localStorage.setItem('doctor_medicines', JSON.stringify(updatedMedicines));
    
    setShowMedicineDialog(false);
    setNewMedicine({ name: '', batch: '', quantity: '', expiryDate: '', priority: 'medium', type: 'clinic' });
    toast({ title: "Medicine added successfully!" });
  };

  const addCamp = () => {
    if (!newCamp.title || !newCamp.date || !newCamp.location) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const camp: Camp = {
      ...newCamp,
      id: `CAMP${Date.now()}`,
      patients: []
    };

    const updatedCamps = [...camps, camp];
    setCamps(updatedCamps);
    localStorage.setItem('doctor_camps', JSON.stringify(updatedCamps));
    
    // Notify patients
    const notification = {
      id: `NOT${Date.now()}`,
      type: 'camp',
      title: 'New Health Camp Organized',
      message: `New health camp "${camp.title}" scheduled for ${camp.date} at ${camp.location}`,
      date: new Date().toISOString(),
      read: false
    };
    
    const existingNotifications = JSON.parse(localStorage.getItem('patient_notifications') || '[]');
    localStorage.setItem('patient_notifications', JSON.stringify([notification, ...existingNotifications]));
    
    setShowCampDialog(false);
    setNewCamp({ title: '', date: '', location: '', description: '', contactInfo: '', status: 'planned' });
    
    // Show notification service
    setNotificationData({
      type: 'camp',
      title: 'New Health Camp Organized',
      message: `Dear Patient, A new health camp "${camp.title}" has been organized on ${camp.date} at ${camp.location}. Please visit our clinic for more details. - Dr. Himanshu Sonagara, Shree Hari Clinic`
    });
    setShowNotificationService(true);
    
    toast({ title: "Camp organized successfully!", description: "Send notifications to patients now." });
  };

  const addPatientReport = () => {
    if (!selectedPatient || !newReport.title) {
      toast({ title: "Please select patient and provide report title", variant: "destructive" });
      return;
    }

    const report = {
      id: `REP${Date.now()}`,
      patientId: selectedPatient.id,
      type: newReport.type,
      title: newReport.title,
      description: newReport.description,
      date: new Date().toISOString().split('T')[0],
      fileName: newReport.file?.name || ''
    };

    // Add to patient reports in localStorage
    const patientReports = JSON.parse(localStorage.getItem('patient_reports') || '[]');
    localStorage.setItem('patient_reports', JSON.stringify([report, ...patientReports]));
    
    setShowAddReportDialog(false);
    setNewReport({ type: '', title: '', description: '', file: null });
    
    // Show notification service
    setNotificationData({
      type: 'report',
      title: 'New Medical Report Added',
      message: `Dear ${selectedPatient.name}, Your medical report "${report.title}" has been added to your records. Please visit our clinic to collect your report. - Dr. Himanshu Sonagara, Shree Hari Clinic`
    });
    setShowNotificationService(true);
    
    toast({ title: "Report added successfully!" });
  };

  const handleBookingAction = (bookingId: string, action: 'approve' | 'reject') => {
    const updatedBookings = bookings.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: action === 'approve' ? 'approved' as const : 'rejected' as const }
        : booking
    );
    setBookings(updatedBookings);
    localStorage.setItem('doctor_bookings', JSON.stringify(updatedBookings));
    
    // Update patient appointments
    const patientAppointments = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
    const updatedPatientAppointments = patientAppointments.map((apt: any) =>
      apt.id === bookingId ? { ...apt, status: action === 'approve' ? 'approved' : 'rejected' } : apt
    );
    localStorage.setItem('patient_appointments', JSON.stringify(updatedPatientAppointments));
    
    toast({ 
      title: `Booking ${action}d successfully!`,
      description: `The patient has been notified.`
    });
  };

  const addPrescription = () => {
    if (!selectedPatient || !newPrescription.medicines[0].name) {
      toast({ title: "Please select patient and add at least one medicine", variant: "destructive" });
      return;
    }

    const prescription: Prescription = {
      id: `PRES${Date.now()}`,
      patientId: selectedPatient.id,
      medicines: newPrescription.medicines.filter(m => m.name).map(m => ({ ...m, id: `MED${Date.now()}_${Math.random()}` })),
      instructions: newPrescription.instructions,
      date: new Date().toISOString().split('T')[0],
      nextVisit: newPrescription.nextVisit
    };

    const visitRecord: VisitRecord = {
      id: `VISIT${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      symptoms: 'Patient consultation',
      diagnosis: 'Prescribed medication',
      prescription: newPrescription.medicines.map(m => `${m.name} - ${m.dosage}`).join(', '),
      nextVisit: newPrescription.nextVisit,
      notes: newPrescription.instructions
    };

    const updatedPatients = patients.map(p => 
      p.id === selectedPatient.id 
        ? { 
            ...p, 
            prescriptions: [...p.prescriptions, prescription],
            visitHistory: [...p.visitHistory, visitRecord],
            lastVisit: new Date().toISOString().split('T')[0],
            nextAppointment: newPrescription.nextVisit
          }
        : p
    );

    setPatients(updatedPatients);
    localStorage.setItem('doctor_patients', JSON.stringify(updatedPatients));
    
    // Also sync to patient portal
    const patientMedicines = JSON.parse(localStorage.getItem('patient_medicines') || '[]');
    const newPatientMedicines = newPrescription.medicines.filter(m => m.name).map(m => ({
      id: `med_${Date.now()}_${Math.random()}`,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      startDate: new Date().toISOString().split('T')[0],
      endDate: m.duration ? new Date(Date.now() + parseInt(m.duration) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
      priority: m.priority,
      type: 'current',
      remainingDays: m.duration ? parseInt(m.duration) : 30
    }));
    localStorage.setItem('patient_medicines', JSON.stringify([...patientMedicines, ...newPatientMedicines]));
    
    setShowPrescriptionDialog(false);
    setNewPrescription({
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', priority: 'medium' }],
      instructions: '', nextVisit: ''
    });
    
    // Show notification service
    const medicineList = newPrescription.medicines.filter(m => m.name).map(m => `${m.name} (${m.dosage})`).join(', ');
    setNotificationData({
      type: 'prescription',
      title: 'New Prescription Added',
      message: `Dear ${selectedPatient.name}, Your new prescription has been prepared: ${medicineList}. Please visit our clinic to collect your medicines. ${newPrescription.nextVisit ? `Next visit: ${newPrescription.nextVisit}` : ''} - Dr. Himanshu Sonagara, Shree Hari Clinic`
    });
    setShowNotificationService(true);
    
    toast({ title: "Prescription added successfully!" });
  };


  const removeMedicine = (id: string) => {
    const updatedMedicines = medicines.filter(m => m.id !== id);
    setMedicines(updatedMedicines);
    localStorage.setItem('doctor_medicines', JSON.stringify(updatedMedicines));
    toast({ title: "Medicine removed successfully!" });
  };

  const exportExpiringMedicines = () => {
    const expiringData = expiringMedicines.map(medicine => ({
      name: medicine.name,
      batch: medicine.batch,
      quantity: medicine.quantity,
      expiryDate: medicine.expiryDate,
      priority: medicine.priority,
      type: medicine.type,
      daysToExpiry: Math.ceil((new Date(medicine.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }));

    const csvContent = [
      ['Medicine Name', 'Batch', 'Quantity', 'Expiry Date', 'Priority', 'Type', 'Days to Expiry'],
      ...expiringData.map(item => [
        item.name,
        item.batch,
        item.quantity.toString(),
        item.expiryDate,
        item.priority,
        item.type,
        item.daysToExpiry.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expiring_medicines_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({ title: "Expiring medicines data exported successfully!" });
  };

  const importMedicines = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            let importedMedicines = [];
            if (file.type === 'application/json') {
              importedMedicines = JSON.parse(event.target.result);
            } else {
              // Parse CSV
              const lines = event.target.result.split('\n');
              const headers = lines[0].split(',');
              importedMedicines = lines.slice(1).filter(line => line.trim()).map((line: string) => {
                const values = line.split(',');
                return {
                  id: `MED${Date.now()}_${Math.random()}`,
                  name: values[0],
                  batch: values[1],
                  quantity: parseInt(values[2]) || 0,
                  expiryDate: values[3],
                  priority: values[4] || 'medium',
                  type: values[5] || 'clinic'
                };
              });
            }

            const updatedMedicines = [...medicines, ...importedMedicines];
            setMedicines(updatedMedicines);
            localStorage.setItem('doctor_medicines', JSON.stringify(updatedMedicines));
            toast({ title: `${importedMedicines.length} medicines imported successfully!` });
          } catch (error) {
            toast({ title: "Import failed", description: "Please check file format", variant: "destructive" });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const removePatient = (id: string) => {
    const updatedPatients = patients.filter(p => p.id !== id);
    setPatients(updatedPatients);
    localStorage.setItem('doctor_patients', JSON.stringify(updatedPatients));
    toast({ title: "Patient removed successfully!" });
  };

  const removeCamp = (id: string) => {
    const updatedCamps = camps.filter(c => c.id !== id);
    setCamps(updatedCamps);
    localStorage.setItem('doctor_camps', JSON.stringify(updatedCamps));
    toast({ title: "Camp removed successfully!" });
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mobile.includes(searchTerm)
  );

  const displayedPatients = patientView === "recent" ? filteredPatients.slice(0, 10) : filteredPatients;
  const clinicPatients = displayedPatients.filter(p => p.type === 'clinic');
  const campPatients = displayedPatients.filter(p => p.type === 'camp');

  const filteredMedicines = medicines.filter(medicine => {
    const typeMatch = medicineFilter === "all" || medicine.type === medicineFilter;
    const expiryMatch = expiryFilter === "all" || (expiryFilter === "expiring" && expiringMedicines.includes(medicine));
    return typeMatch && expiryMatch;
  }).sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <Layout title="Dr. Himanshu Sonagara - Shree Hari Clinic">
      <div className="space-y-6">
        {/* Doctor Info Header */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-full shadow-glow">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-medical-dark">Dr. Himanshu Sonagara</h1>
                <p className="text-lg text-primary font-semibold">B.H.M.S | Reg. No: G - 28048</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>9723996594</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>drhimanshusonagara@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-full shadow-glow">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-medical-dark">Shree Hari Clinic</h2>
                <p className="text-primary font-semibold">Skin, Child & Homeo Care</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Amroli, Surat, Gujarat - 394210
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="camps">Camps</TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-1" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
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
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Patient Bookings</h2>
              <Badge variant="secondary">{bookings.filter(b => b.status === 'pending').length} Pending</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className={cn(
                  "hover:shadow-lg transition-all",
                  booking.status === 'pending' && "border-yellow-200 bg-yellow-50",
                  booking.status === 'approved' && "border-green-200 bg-green-50",
                  booking.status === 'rejected' && "border-red-200 bg-red-50"
                )}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-sm">{booking.patientName}</h3>
                          <p className="text-xs text-muted-foreground">ID: {booking.patientId}</p>
                        </div>
                        <Badge variant={
                          booking.status === 'pending' ? 'secondary' :
                          booking.status === 'approved' ? 'default' :
                          booking.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <p><strong>Type:</strong> {booking.type}</p>
                        <p><strong>Date:</strong> {booking.date}</p>
                        <p><strong>Time:</strong> {booking.time}</p>
                        <p><strong>Reason:</strong> {booking.reason}</p>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            onClick={() => {
                              const updatedBookings = bookings.map(b =>
                                b.id === booking.id ? { ...b, status: 'approved' as const } : b
                              );
                              setBookings(updatedBookings);
                              localStorage.setItem('doctor_bookings', JSON.stringify(updatedBookings));
                              
                              // Update patient portal
                              const patientBookings = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
                              const updatedPatientBookings = patientBookings.map((b: any) =>
                                b.id === booking.id ? { ...b, status: 'approved' } : b
                              );
                              localStorage.setItem('patient_appointments', JSON.stringify(updatedPatientBookings));
                              
                              toast({ title: "Booking approved!", description: `${booking.patientName}'s appointment has been approved.` });
                            }}
                            className="flex-1"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              const updatedBookings = bookings.map(b =>
                                b.id === booking.id ? { ...b, status: 'rejected' as const } : b
                              );
                              setBookings(updatedBookings);
                              localStorage.setItem('doctor_bookings', JSON.stringify(updatedBookings));
                              
                              // Update patient portal
                              const patientBookings = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
                              const updatedPatientBookings = patientBookings.map((b: any) =>
                                b.id === booking.id ? { ...b, status: 'rejected' } : b
                              );
                              localStorage.setItem('patient_appointments', JSON.stringify(updatedPatientBookings));
                              
                              toast({ title: "Booking rejected", description: `${booking.patientName}'s appointment has been rejected.` });
                            }}
                            className="flex-1"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {bookings.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No bookings found</p>
              </div>
            )}
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
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
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedPatient(patient); setShowPrescriptionDialog(true); }}>
                              <FileEdit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => removePatient(patient.id)}>
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
                          <p className="text-xs"><strong>Last Visit:</strong> {patient.lastVisit}</p>
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
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedPatient(patient); setShowPrescriptionDialog(true); }}>
                              <FileEdit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => removePatient(patient.id)}>
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
                          <p className="text-xs"><strong>Last Visit:</strong> {patient.lastVisit}</p>
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
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold">Medicine Inventory</h2>
              <div className="flex gap-2">
                <Button onClick={exportExpiringMedicines} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Expiring
                </Button>
                <Button onClick={importMedicines} variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button onClick={() => setShowMedicineDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medicine
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Select value={medicineFilter} onValueChange={(value: "all" | "clinic" | "camp" | "others") => setMedicineFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Inventory</SelectItem>
                  <SelectItem value="clinic">Clinic Inventory</SelectItem>
                  <SelectItem value="camp">Camp Inventory</SelectItem>
                  <SelectItem value="others">Others Inventory</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={expiryFilter} onValueChange={(value: "all" | "expiring") => setExpiryFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Medicines</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={medicineFilter === "all" ? "all" : medicineFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" onClick={() => setMedicineFilter("all")}>
                  All ({medicines.length})
                </TabsTrigger>
                <TabsTrigger value="clinic" onClick={() => setMedicineFilter("clinic")}>
                  <Building2 className="w-4 h-4 mr-1" />
                  Clinic ({medicines.filter(m => m.type === 'clinic').length})
                </TabsTrigger>
                <TabsTrigger value="camp" onClick={() => setMedicineFilter("camp")}>
                  <Tent className="w-4 h-4 mr-1" />
                  Camp ({medicines.filter(m => m.type === 'camp').length})
                </TabsTrigger>
                <TabsTrigger value="others" onClick={() => setMedicineFilter("others")}>
                  <Package className="w-4 h-4 mr-1" />
                  Others ({medicines.filter(m => m.type === 'others').length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={medicineFilter === "all" ? "all" : medicineFilter}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                  {filteredMedicines.map((medicine) => {
                    const isExpiring = expiringMedicines.includes(medicine);
                    return (
                      <Card key={medicine.id} className={cn(
                        "hover:shadow-lg transition-all",
                        isExpiring && "border-red-200 bg-red-50",
                        medicine.priority === 'high' && "border-l-4 border-l-red-500",
                        medicine.priority === 'medium' && "border-l-4 border-l-yellow-500",
                        medicine.priority === 'low' && "border-l-4 border-l-green-500"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-sm">{medicine.name}</h3>
                              <p className="text-xs text-muted-foreground">Batch: {medicine.batch}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => removeMedicine(medicine.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Badge variant={
                                medicine.priority === 'high' ? 'destructive' : 
                                medicine.priority === 'medium' ? 'default' : 'secondary'
                              } className="text-xs">
                                {medicine.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {medicine.type}
                              </Badge>
                            </div>
                            <p className="text-xs"><strong>Quantity:</strong> {medicine.quantity}</p>
                            <p className="text-xs"><strong>Expiry:</strong> {medicine.expiryDate}</p>
                            {isExpiring && (
                              <Badge variant="destructive" className="text-xs w-full justify-center">
                                Expiring Soon!
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Camps Tab */}
          <TabsContent value="camps" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Camp Management</h2>
              <Button onClick={() => setShowCampDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Organize Camp
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {camps.map((camp) => (
                <Card key={camp.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{camp.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{camp.location}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedCamp(camp)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => removeCamp(camp.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{camp.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{camp.contactInfo}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{camp.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant={
                          camp.status === 'completed' ? 'default' :
                          camp.status === 'ongoing' ? 'destructive' : 'secondary'
                        }>
                          {camp.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {camp.patients?.length || 0} patients
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold">Patient Notifications</h2>
              <Button onClick={() => {
                setNotificationData({ type: 'manual', message: '', title: '' });
                setShowNotificationService(true);
              }}>
                <Send className="mr-2 h-4 w-4" />
                Send Manual Notification
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">WhatsApp Notifications</h3>
                    <p className="text-sm text-blue-700">Send instant messages via WhatsApp</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500 rounded-full">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">SMS Notifications</h3>
                    <p className="text-sm text-green-700">Send text messages to all patients</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500 rounded-full">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900">Auto Notifications</h3>
                    <p className="text-sm text-purple-700">Automatic alerts for camps & prescriptions</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Notification Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Camp Announcement</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      "Dear Patient, A new health camp has been organized. Please visit our clinic for more details."
                    </p>
                    <Button size="sm" onClick={() => {
                      setNotificationData({
                        type: 'camp',
                        title: 'Health Camp Announcement',
                        message: 'Dear Patient, A new health camp has been organized. Please visit our clinic for more details. - Dr. Himanshu Sonagara, Shree Hari Clinic'
                      });
                      setShowNotificationService(true);
                    }}>
                      Use Template
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Prescription Ready</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      "Dear Patient, Your prescription is ready for collection. Please visit our clinic."
                    </p>
                    <Button size="sm" onClick={() => {
                      setNotificationData({
                        type: 'prescription',
                        title: 'Prescription Ready',
                        message: 'Dear Patient, Your prescription is ready for collection. Please visit our clinic at your convenience. - Dr. Himanshu Sonagara, Shree Hari Clinic'
                      });
                      setShowNotificationService(true);
                    }}>
                      Use Template
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Report Available</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      "Dear Patient, Your medical report is ready. Please visit our clinic to collect it."
                    </p>
                    <Button size="sm" onClick={() => {
                      setNotificationData({
                        type: 'report',
                        title: 'Medical Report Ready',
                        message: 'Dear Patient, Your medical report is ready. Please visit our clinic to collect it. - Dr. Himanshu Sonagara, Shree Hari Clinic'
                      });
                      setShowNotificationService(true);
                    }}>
                      Use Template
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Appointment Reminder</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      "Dear Patient, This is a reminder for your upcoming appointment. Please arrive on time."
                    </p>
                    <Button size="sm" onClick={() => {
                      setNotificationData({
                        type: 'manual',
                        title: 'Appointment Reminder',
                        message: 'Dear Patient, This is a reminder for your upcoming appointment. Please arrive on time. - Dr. Himanshu Sonagara, Shree Hari Clinic'
                      });
                      setShowNotificationService(true);
                    }}>
                      Use Template
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Patient Dialog */}
        <Dialog open={showPatientDialog} onOpenChange={setShowPatientDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Patient Type</Label>
                <Select value={newPatient.type} onValueChange={(value: 'clinic' | 'camp') => setNewPatient(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinic">Clinic Patient</SelectItem>
                    <SelectItem value="camp">Camp Patient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Full Name</Label>
                <Input 
                  value={newPatient.name} 
                  onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label>Mobile Number</Label>
                <Input 
                  value={newPatient.mobile} 
                  onChange={(e) => setNewPatient(prev => ({ ...prev, mobile: e.target.value }))}
                  placeholder="Enter mobile number"
                />
              </div>
              <div>
                <Label>Age</Label>
                <Input 
                  type="number"
                  value={newPatient.age} 
                  onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter age"
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={newPatient.gender} onValueChange={(value) => setNewPatient(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newPatient.type === 'camp' && (
                <div>
                  <Label>Camp Location</Label>
                  <Input 
                    value={newPatient.campId} 
                    onChange={(e) => setNewPatient(prev => ({ ...prev, campId: e.target.value }))}
                    placeholder="Enter camp location"
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Textarea 
                  value={newPatient.address} 
                  onChange={(e) => setNewPatient(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Medical History</Label>
                <Textarea 
                  value={newPatient.medicalHistory} 
                  onChange={(e) => setNewPatient(prev => ({ ...prev, medicalHistory: e.target.value }))}
                  placeholder="Enter medical history"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowPatientDialog(false)}>Cancel</Button>
              <Button onClick={addPatient}>Add Patient</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Medicine Dialog */}
        <Dialog open={showMedicineDialog} onOpenChange={setShowMedicineDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Medicine</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Medicine Type</Label>
                <Select value={newMedicine.type} onValueChange={(value: 'clinic' | 'camp' | 'others') => setNewMedicine(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinic">Clinic Inventory</SelectItem>
                    <SelectItem value="camp">Camp Inventory</SelectItem>
                    <SelectItem value="others">Others Inventory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Medicine Name</Label>
                <Input 
                  value={newMedicine.name} 
                  onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter medicine name"
                />
              </div>
              <div>
                <Label>Batch Number</Label>
                <Input 
                  value={newMedicine.batch} 
                  onChange={(e) => setNewMedicine(prev => ({ ...prev, batch: e.target.value }))}
                  placeholder="Enter batch number"
                />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input 
                  type="number"
                  value={newMedicine.quantity} 
                  onChange={(e) => setNewMedicine(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input 
                  type="date"
                  value={newMedicine.expiryDate} 
                  onChange={(e) => setNewMedicine(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={newMedicine.priority} onValueChange={(value: 'high' | 'medium' | 'low') => setNewMedicine(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowMedicineDialog(false)}>Cancel</Button>
              <Button onClick={addMedicine}>Add Medicine</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Camp Dialog */}
        <Dialog open={showCampDialog} onOpenChange={setShowCampDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Organize Health Camp</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Camp Title</Label>
                <Input 
                  value={newCamp.title} 
                  onChange={(e) => setNewCamp(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter camp title"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input 
                  type="date"
                  value={newCamp.date} 
                  onChange={(e) => setNewCamp(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input 
                  value={newCamp.location} 
                  onChange={(e) => setNewCamp(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label>Contact Information</Label>
                <Input 
                  value={newCamp.contactInfo} 
                  onChange={(e) => setNewCamp(prev => ({ ...prev, contactInfo: e.target.value }))}
                  placeholder="Enter contact information"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={newCamp.description} 
                  onChange={(e) => setNewCamp(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter camp description"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={newCamp.status} onValueChange={(value: 'planned' | 'ongoing' | 'completed') => setNewCamp(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCampDialog(false)}>Cancel</Button>
              <Button onClick={addCamp}>Organize Camp</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Prescription Dialog */}
        <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Prescription for {selectedPatient?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Medicines</Label>
                {newPrescription.medicines.map((medicine, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2 p-3 border rounded-lg">
                    <Input 
                      placeholder="Medicine name"
                      value={medicine.name}
                      onChange={(e) => {
                        const updated = [...newPrescription.medicines];
                        updated[index].name = e.target.value;
                        setNewPrescription(prev => ({ ...prev, medicines: updated }));
                      }}
                    />
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
                    <div className="flex gap-1">
                      <Select 
                        value={medicine.priority} 
                        onValueChange={(value: 'high' | 'medium' | 'low') => {
                          const updated = [...newPrescription.medicines];
                          updated[index].priority = value;
                          setNewPrescription(prev => ({ ...prev, medicines: updated }));
                        }}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Med</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
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
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNewPrescription(prev => ({ 
                      ...prev, 
                      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', priority: 'medium' }]
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
              <Button variant="outline" onClick={() => setShowPrescriptionDialog(false)}>Cancel</Button>
              <Button onClick={addPrescription}>Add Prescription</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Patient History Dialog */}
        <Dialog open={showPatientHistory} onOpenChange={setShowPatientHistory}>
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
                          <div className="md:col-span-2"><strong>Prescription:</strong> {visit.prescription}</div>
                          {visit.notes && (
                            <div className="md:col-span-2"><strong>Notes:</strong> {visit.notes}</div>
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

        {/* Add Report Dialog */}
        <Dialog open={showAddReportDialog} onOpenChange={setShowAddReportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Medical Report for {selectedPatient?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Report Type</Label>
                <Select value={newReport.type} onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lab Test">Lab Test</SelectItem>
                    <SelectItem value="X-Ray">X-Ray</SelectItem>
                    <SelectItem value="Blood Test">Blood Test</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Prescription">Prescription</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Report Title</Label>
                <Input
                  value={newReport.title}
                  onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter report title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter report description..."
                />
              </div>

              <div>
                <Label>Upload File (Optional)</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setNewReport(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddReportDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={addPatientReport}>
                  Add Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notification Service Dialog */}
        <NotificationService
          isOpen={showNotificationService}
          onClose={() => setShowNotificationService(false)}
          notificationType={notificationData.type}
          initialMessage={notificationData.message}
          initialTitle={notificationData.title}
        />
      </div>
    </Layout>
  );
}
