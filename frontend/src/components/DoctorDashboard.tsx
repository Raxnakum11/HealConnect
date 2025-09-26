import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { NotificationService } from '@/components/NotificationService';
import { api } from '@/lib/api';

// Icons
import { 
  Stethoscope, Phone, Mail, Heart, Bell, Plus, Users, Building2, 
  Tent, Pill, AlertTriangle, Eye, MapPin, CalendarIcon, 
  CheckCircle, X, Calendar, FileEdit, Trash2, Download, Upload,
  Package, Send, MessageSquare, Smartphone
} from 'lucide-react';

// Modular Components
import Dashboard from './DoctorDashboard/Dashboard';
import Patients from './DoctorDashboard/Patients';
import BookingComponent from './DoctorDashboard/Booking';
import Inventory from './DoctorDashboard/Inventory';
import Camps from './DoctorDashboard/Camps';
import Notification from './DoctorDashboard/Notification';

// Dialog Components
import AddPatientDialog from './DoctorDashboard/AddPatientDialog';
import AddMedicineDialog from './DoctorDashboard/AddMedicineDialog';
import AddCampDialog from './DoctorDashboard/AddCampDialog';
import AddPrescriptionDialog from './DoctorDashboard/AddPrescriptionDialog';
import PatientHistoryDialog from './DoctorDashboard/PatientHistoryDialog';
import AddReportDialog from './DoctorDashboard/AddReportDialog';
import EmailNotificationDialog from './DoctorDashboard/EmailNotificationDialog';

// Interfaces
interface Patient {
  id: string;
  name: string;
  mobile: string;
  email?: string;
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
  inventoryId: string;
  inventoryType: 'clinic' | 'camp' | 'others';
}

interface Medicine {
  id: string;
  name: string;
  batch: string;
  quantity: number;
  size: string;
  unit: 'mg' | 'g' | 'ml' | 'tablets' | 'capsules' | 'drops' | 'syrup';
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
  const { user } = useAuth();
  const doctorSpecialization = user?.role === 'doctor' ? user.specialization : undefined;
  const { toast } = useToast();
  
  // State management
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<Patient | null>(null);
  const [selectedCampData, setSelectedCampData] = useState<Camp | null>(null);
  
  // Dialog states
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [showMedicineDialog, setShowMedicineDialog] = useState(false);
  const [showCampDialog, setShowCampDialog] = useState(false);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [showPatientHistory, setShowPatientHistory] = useState(false);
  const [showAddReportDialog, setShowAddReportDialog] = useState(false);
  const [showNotificationService, setShowNotificationService] = useState(false);
  const [showEmailNotificationDialog, setShowEmailNotificationDialog] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [patientView, setPatientView] = useState<"recent" | "all">("recent");
  const [medicineFilter, setMedicineFilter] = useState<"all" | "clinic" | "camp" | "others">("all");
  const [expiryFilter, setExpiryFilter] = useState<"all" | "expiring">("all");
  
  // Form states
  const [newPatient, setNewPatient] = useState({
    name: '', mobile: '', email: '', age: '', gender: '', address: '', medicalHistory: '', 
    type: 'clinic' as 'clinic' | 'camp', campId: ''
  });
  
  const [newMedicine, setNewMedicine] = useState({
    name: '', batch: '', quantity: '', size: '', unit: 'mg' as 'mg' | 'g' | 'ml' | 'tablets' | 'capsules' | 'drops' | 'syrup', expiryDate: '', 
    priority: 'medium' as 'high' | 'medium' | 'low', 
    type: 'clinic' as 'clinic' | 'camp' | 'others'
  });
  
  const [newCamp, setNewCamp] = useState({
    title: '', date: '', location: '', description: '', contactInfo: '', 
    status: 'planned' as 'planned' | 'ongoing' | 'completed'
  });

  const [newPrescription, setNewPrescription] = useState({
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', inventoryId: '', inventoryType: 'clinic' as 'clinic' | 'camp' | 'others' }],
    instructions: '', nextVisit: ''
  });

  const [newReport, setNewReport] = useState({
    type: '', title: '', description: '', file: null as File | null
  });

  const [notificationData, setNotificationData] = useState({ 
    type: 'manual' as 'camp' | 'prescription' | 'report' | 'manual', 
    message: '', title: '' 
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load patients from API
      const patientsData = await api.patients.getPatients();
      setPatients(Array.isArray(patientsData) ? patientsData : []);

      // Load medicines from API
      const medicinesData = await api.medicines.getMedicines();
      setMedicines(Array.isArray(medicinesData) ? medicinesData : []);

      // Load camps from API
      const campsData = await api.camps.getCamps();
      if (Array.isArray(campsData) && campsData.length > 0) {
        setCamps(campsData);
      } else {
        // Add sample camps for initial setup
        const sampleCamps = [
          {
            name: 'Health Camp - Village A',
            date: new Date('2025-09-25'),
            location: 'Village A Community Center',
            description: 'Free health checkup and consultation for villagers',
            organizer: 'Dr. Himanshu Sonagara',
            organizerContact: '9876543210',
            time: '9:00 AM',
            type: 'camp',
            expectedPatients: 100,
            notes: 'Dr. Himanshu - 9876543210'
          },
          {
            name: 'Eye Care Camp',
            date: new Date('2025-09-30'),
            location: 'School Grounds',
            description: 'Eye examination and glasses distribution',
            organizer: 'Dr. Himanshu Sonagara',
            organizerContact: '9876543211',
            time: '10:00 AM',
            type: 'camp',
            expectedPatients: 50,
            notes: 'Contact: 9876543211'
          }
        ];
        
        // Create sample camps in the database
        const createdCamps = [];
        for (const camp of sampleCamps) {
          const createdCamp = await api.camps.createCamp(camp);
          createdCamps.push(createdCamp);
        }
        
        // Set the created camps directly
        setCamps(createdCamps);
      }

      // Load appointments from API
      try {
        const appointmentsResponse = await api.appointments.getDoctorAppointments();
        console.log('🔍 Appointments loaded:', appointmentsResponse);
        
        if (appointmentsResponse.success && appointmentsResponse.data.appointments) {
          const appointments = appointmentsResponse.data.appointments;
          
          // Convert appointments to booking format for display
          const bookingsData = appointments.map(appointment => ({
            id: appointment._id,
            patientName: appointment.patientId?.name || 'Unknown Patient',
            patientId: appointment.patientId?.patientId || 'N/A',
            date: new Date(appointment.appointmentDate).toLocaleDateString(),
            time: appointment.appointmentTime,
            type: appointment.appointmentType,
            reason: appointment.reasonForVisit,
            status: appointment.status === 'scheduled' ? 'pending' : 
                   appointment.status === 'confirmed' ? 'approved' :
                   appointment.status === 'cancelled' ? 'cancelled' : 
                   appointment.status
          }));
          
          setBookings(bookingsData);
          console.log(`✅ Loaded ${bookingsData.length} appointments`);
        } else {
          setBookings([]);
        }
      } catch (appointmentError) {
        console.error('Error loading appointments:', appointmentError);
        setBookings([]);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data from server",
        variant: "destructive",
      });
      
      // Fallback to empty arrays if API fails
      setPatients([]);
      setMedicines([]);
      setCamps([]);
      setBookings([]);
    }
  };

  // Computed values
  const expiringMedicines = medicines.filter(medicine => {
    const expiryDate = new Date(medicine.expiryDate);
    const today = new Date();
    const daysDifference = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference <= 30 && daysDifference >= 0;
  });

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

  // Helper functions
  const generatePatientId = (type: 'clinic' | 'camp', campLocation?: string) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const uniqueId = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    if (type === 'camp' && campLocation) {
      const locationCode = campLocation.substring(0, 3).toUpperCase();
      return `CAMP/${locationCode}/${year}/${month}/${uniqueId}`;
    }
    return `${type.toUpperCase()}/${year}/${month}/${uniqueId}`;
  };

  // CRUD operations
  const addPatient = async () => {
    if (!newPatient.name || !newPatient.mobile || !newPatient.age || !newPatient.gender) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (newPatient.type === 'camp' && !newPatient.campId) {
      toast({ title: "Please select a camp for camp patients", variant: "destructive" });
      return;
    }

    try {
      const patientData = {
        name: newPatient.name,
        mobile: newPatient.mobile,
        age: parseInt(newPatient.age),
        gender: newPatient.gender,
        address: newPatient.address,
        medicalHistory: newPatient.medicalHistory,
        type: newPatient.type,
        campId: newPatient.campId || undefined
      };

      // Create patient via API
      const createdPatient = await api.patients.createPatient(patientData);
      
      // Update local state
      const updatedPatients = [...patients, createdPatient];
      setPatients(updatedPatients);
      
      // If it's a camp patient, update the camp
      if (createdPatient.type === 'camp' && createdPatient.campId) {
        // Reload camps to get updated camp data
        const updatedCamps = await api.camps.getCamps();
        setCamps(Array.isArray(updatedCamps) ? updatedCamps : []);
      }
      
      setShowPatientDialog(false);
      setNewPatient({ name: '', mobile: '', email: '', age: '', gender: '', address: '', medicalHistory: '', type: 'clinic', campId: '' });
      
      toast({ 
        title: `${createdPatient.type === 'clinic' ? 'Clinic' : 'Camp'} patient added successfully!`, 
        description: `Patient ID: ${createdPatient._id}` 
      });
    } catch (error) {
      console.error('Error adding patient:', error);
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addMedicine = async () => {
    if (!newMedicine.name || !newMedicine.batch || !newMedicine.quantity || !newMedicine.size || !newMedicine.unit || !newMedicine.expiryDate) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      const medicineData = {
        name: newMedicine.name,
        batch: newMedicine.batch,
        quantity: parseInt(newMedicine.quantity),
        size: newMedicine.size,
        unit: newMedicine.unit,
        expiryDate: new Date(newMedicine.expiryDate),
        priority: newMedicine.priority,
        type: newMedicine.type
      };

      // Create medicine via API
      const createdMedicine = await api.medicines.createMedicine(medicineData);
      
      // Update local state
      const updatedMedicines = [...medicines, createdMedicine];
      setMedicines(updatedMedicines);
      
      setShowMedicineDialog(false);
      setNewMedicine({ name: '', batch: '', quantity: '', size: '', unit: 'mg', expiryDate: '', priority: 'medium', type: 'clinic' });
      toast({ title: "Medicine added successfully!" });
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast({
        title: "Error",
        description: "Failed to add medicine. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addCamp = async () => {
    if (!newCamp.title || !newCamp.date || !newCamp.location) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      const campData = {
        name: newCamp.title,
        date: new Date(newCamp.date),
        location: newCamp.location,
        description: newCamp.description,
        organizer: 'Dr. Himanshu Sonagara',
        organizerContact: '9876543210',
        time: '10:00 AM',
        type: 'camp',
        expectedPatients: 50,
        notes: newCamp.contactInfo
      };

      // Create camp via API
      const createdCamp = await api.camps.createCamp(campData);
      
      // Update local state
      const updatedCamps = [...camps, createdCamp];
      setCamps(updatedCamps);
      
      setShowCampDialog(false);
      setNewCamp({ title: '', date: '', location: '', description: '', contactInfo: '', status: 'planned' });
      
      setNotificationData({
        type: 'camp',
        title: 'New Health Camp Organized',
        message: `Dear Patient, A new health camp "${createdCamp.title}" has been organized on ${new Date(createdCamp.date).toLocaleDateString()} at ${createdCamp.location}. Please visit our clinic for more details. - Dr. Himanshu Sonagara, Shree Hari Clinic`
      });
      setShowNotificationService(true);
      
      toast({ title: "Camp organized successfully!", description: "Send notifications to patients now." });
    } catch (error) {
      console.error('Error adding camp:', error);
      toast({
        title: "Error",
        description: "Failed to organize camp. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addPrescription = () => {
    if (!selectedPatientHistory || newPrescription.medicines.length === 0) {
      toast({ title: "Please select patient and add medicines", variant: "destructive" });
      return;
    }

    const prescription: Prescription = {
      id: `PRES${Date.now()}`,
      patientId: selectedPatientHistory.id,
      medicines: newPrescription.medicines.map((med, index) => ({
        id: `MED${Date.now()}_${index}`,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        inventoryId: med.inventoryId,
        inventoryType: med.inventoryType
      })),
      instructions: newPrescription.instructions,
      date: new Date().toISOString().split('T')[0],
      nextVisit: newPrescription.nextVisit
    };

    const updatedPatients = patients.map(patient =>
      patient.id === selectedPatientHistory.id
        ? { ...patient, prescriptions: [...patient.prescriptions, prescription] }
        : patient
    );

    setPatients(updatedPatients);
    localStorage.setItem('doctor_patients', JSON.stringify(updatedPatients));
    
    setShowPrescriptionDialog(false);
    setNewPrescription({
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', inventoryId: '', inventoryType: 'clinic' }],
      instructions: '', nextVisit: ''
    });
    
    toast({ title: "Prescription added successfully!" });
  };

  const addPatientReport = () => {
    if (!selectedPatientHistory || !newReport.type || !newReport.title) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    // In a real app, you would save this to a reports collection
    setShowAddReportDialog(false);
    setNewReport({ type: '', title: '', description: '', file: null });
    
    toast({ title: "Medical report added successfully!" });
  };

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject') => {
    try {
      // Map action to appointment status
      const status = action === 'approve' ? 'confirmed' : 'cancelled';
      
      // Update appointment status via API
      const response = await api.appointments.updateAppointmentStatus(
        bookingId, 
        status, 
        '', 
        action === 'reject' ? 'Rejected by doctor' : ''
      );
      
      if (response.success) {
        // Update local state
        const updatedBookings = bookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: action === 'approve' ? 'approved' as const : 'rejected' as const }
            : booking
        );
        setBookings(updatedBookings);
        
        toast({ 
          title: `Booking ${action}d successfully!`,
          description: `The patient has been notified.`
        });
        
        console.log(`✅ Appointment ${bookingId} ${action}d successfully`);
      } else {
        throw new Error(response.message || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} booking. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const removePatient = (id: string) => {
    const updatedPatients = patients.filter(p => p.id !== id);
    setPatients(updatedPatients);
    localStorage.setItem('doctor_patients', JSON.stringify(updatedPatients));
    toast({ title: "Patient removed successfully!" });
  };

  const removeMedicine = (id: string) => {
    const updatedMedicines = medicines.filter(m => m.id !== id);
    setMedicines(updatedMedicines);
    localStorage.setItem('doctor_medicines', JSON.stringify(updatedMedicines));
    toast({ title: "Medicine removed successfully!" });
  };

  const removeCamp = (id: string) => {
    const updatedCamps = camps.filter(c => c.id !== id);
    setCamps(updatedCamps);
    localStorage.setItem('doctor_camps', JSON.stringify(updatedCamps));
    toast({ title: "Camp removed successfully!" });
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
        item.name, item.batch, item.quantity.toString(), item.expiryDate, 
        item.priority, item.type, item.daysToExpiry.toString()
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
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          try {
            const content = event.target?.result as string;
            let importedMedicines = [];
            
            if (file.type === 'application/json') {
              importedMedicines = JSON.parse(content);
            } else {
              // CSV parsing logic would go here
              toast({ title: "CSV import feature coming soon!", variant: "default" });
              return;
            }
            
            const updatedMedicines = [...medicines, ...importedMedicines];
            setMedicines(updatedMedicines);
            localStorage.setItem('doctor_medicines', JSON.stringify(updatedMedicines));
            toast({ title: `${importedMedicines.length} medicines imported successfully!` });
          } catch (error) {
            toast({ title: "Error importing medicines", variant: "destructive" });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

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
            <Dashboard
              patients={patients}
              medicines={medicines}
              expiringMedicines={expiringMedicines}
              clinicPatients={clinicPatients}
              campPatients={campPatients}
              setSelectedPatient={(patient: Patient) => setSelectedPatientHistory(patient)}
              setActiveTab={setActiveTab}
              setPatientView={setPatientView}
              setExpiryFilter={setExpiryFilter}
            />
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Patients
              patients={patients}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              patientView={patientView}
              setPatientView={setPatientView}
              clinicPatients={clinicPatients}
              campPatients={campPatients}
              camps={camps}
              setShowPatientDialog={setShowPatientDialog}
              setSelectedPatient={(patient: Patient) => setSelectedPatientHistory(patient)}
              setShowPatientHistory={setShowPatientHistory}
              setShowPrescriptionDialog={setShowPrescriptionDialog}
              removePatient={removePatient}
            />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <BookingComponent
              bookings={bookings}
              handleBookingAction={handleBookingAction}
            />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Inventory
              medicines={medicines}
              expiringMedicines={expiringMedicines}
              medicineFilter={medicineFilter}
              setMedicineFilter={setMedicineFilter}
              expiryFilter={expiryFilter}
              setExpiryFilter={setExpiryFilter}
              filteredMedicines={filteredMedicines}
              setShowMedicineDialog={setShowMedicineDialog}
              removeMedicine={removeMedicine}
              exportExpiringMedicines={exportExpiringMedicines}
              importMedicines={importMedicines}
            />
          </TabsContent>

          {/* Camps Tab */}
          <TabsContent value="camps" className="space-y-6">
            <Camps
              camps={camps}
              setShowCampDialog={setShowCampDialog}
              setSelectedCamp={(camp: Camp) => setSelectedCampData(camp)}
              removeCamp={removeCamp}
            />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button 
                onClick={() => setShowNotificationService(true)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                SMS/WhatsApp Notifications
              </Button>
              <Button 
                onClick={() => setShowEmailNotificationDialog(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email Notifications
              </Button>
            </div>
            
            <Notification
              setNotificationData={(data: { type: string; title: string; message: string; }) => {
                setNotificationData({
                  type: data.type as 'camp' | 'prescription' | 'report' | 'manual',
                  title: data.title,
                  message: data.message
                });
              }}
              setShowNotificationService={setShowNotificationService}
            />
          </TabsContent>
        </Tabs>

        {/* Dialog Components */}
        <AddPatientDialog
          isOpen={showPatientDialog}
          onOpenChange={setShowPatientDialog}
          newPatient={newPatient}
          setNewPatient={setNewPatient}
          onAddPatient={addPatient}
          camps={camps}
        />

        <AddMedicineDialog
          isOpen={showMedicineDialog}
          onOpenChange={setShowMedicineDialog}
          newMedicine={newMedicine}
          setNewMedicine={setNewMedicine}
          onAddMedicine={addMedicine}
        />

        <AddCampDialog
          isOpen={showCampDialog}
          onOpenChange={setShowCampDialog}
          newCamp={newCamp}
          setNewCamp={setNewCamp}
          onAddCamp={addCamp}
        />

        <AddPrescriptionDialog
          isOpen={showPrescriptionDialog}
          onOpenChange={setShowPrescriptionDialog}
          selectedPatient={selectedPatientHistory}
          newPrescription={newPrescription}
          setNewPrescription={setNewPrescription}
          onAddPrescription={addPrescription}
        />

        <PatientHistoryDialog
          isOpen={showPatientHistory}
          onOpenChange={setShowPatientHistory}
          selectedPatient={selectedPatientHistory}
          doctorSpecialization={doctorSpecialization}
        />

        <AddReportDialog
          isOpen={showAddReportDialog}
          onOpenChange={setShowAddReportDialog}
          selectedPatient={selectedPatientHistory}
          newReport={newReport}
          setNewReport={setNewReport}
          onAddPatientReport={addPatientReport}
        />

        {/* Notification Service Dialog */}
        <NotificationService
          isOpen={showNotificationService}
          onClose={() => setShowNotificationService(false)}
          notificationType={notificationData.type}
          initialMessage={notificationData.message}
          initialTitle={notificationData.title}
        />

        {/* Email Notification Dialog */}
        <EmailNotificationDialog
          isOpen={showEmailNotificationDialog}
          onClose={() => setShowEmailNotificationDialog(false)}
          patients={patients.map(patient => ({
            id: patient.id,
            name: patient.name,
            email: patient.email || '',
            mobile: patient.mobile
          }))}
        />
      </div>
    </Layout>
  );
}
