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
import { formatDate } from '@/lib/utils';
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
import ImportMedicinesDialog from './DoctorDashboard/ImportMedicinesDialog';

// Dialog Components
import AddPatientDialog from './DoctorDashboard/AddPatientDialog';
import AddMedicineDialog from './DoctorDashboard/AddMedicineDialog';
import AddCampDialog from './DoctorDashboard/AddCampDialog';
import AddPrescriptionDialog from './DoctorDashboard/AddPrescriptionDialog';
import PatientHistoryDialog from './DoctorDashboard/PatientHistoryDialog';
import AddReportDialog from './DoctorDashboard/AddReportDialog';
import EmailNotificationDialog from './DoctorDashboard/EmailNotificationDialog';
import CampPatientsDialog from './DoctorDashboard/CampPatientsDialog';



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
  type: 'clinic' | 'camp';
  campId?: string;
  visitHistory?: any[];
  prescriptions?: Prescription[];
}

export function DoctorDashboard() {
  const { user } = useAuth();
  const doctorSpecialization = user?.role === 'doctor' ? user.specialization : undefined;
  const { toast } = useToast();

  // Sample data functions for offline mode
  const getSamplePatients = (): Patient[] => [
    {
      id: 'sample-patient-1',
      name: 'John Doe',
      mobile: '9876543210',
      email: 'john@example.com',
      age: 35,
      gender: 'Male',
      address: '123 Main St, City',
      medicalHistory: 'Diabetes, Hypertension',
      lastVisit: '2025-09-15',
      type: 'clinic' as 'clinic' | 'camp',
      visitHistory: [],
      prescriptions: []
    },
    {
      id: 'sample-patient-2',
      name: 'Jane Smith',
      mobile: '9876543211',
      email: 'jane@example.com',
      age: 28,
      gender: 'Female',
      address: '456 Oak Ave, Town',
      medicalHistory: 'Asthma',
      lastVisit: '2025-09-20',
      type: 'clinic' as 'clinic' | 'camp',
      visitHistory: [],
      prescriptions: []
    }
  ];

  const getSampleMedicines = () => [
    {
      id: 'sample-med-1',
      name: 'Paracetamol',
      batch: 'B001',
      quantity: 100,
      size: '500',
      unit: 'mg' as 'mg',
      expiryDate: '2026-12-31',
      priority: 'medium' as 'medium',
      type: 'clinic' as 'clinic'
    },
    {
      id: 'sample-med-2',
      name: 'Ibuprofen',
      batch: 'B002',
      quantity: 50,
      size: '200',
      unit: 'mg' as 'mg',
      expiryDate: '2026-06-30',
      priority: 'high' as 'high',
      type: 'clinic' as 'clinic'
    }
  ];
  
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
  const [showCampPatientsDialog, setShowCampPatientsDialog] = useState(false);
  const [selectedCampForPatients, setSelectedCampForPatients] = useState<Camp | null>(null);
  const [showImportMedicinesDialog, setShowImportMedicinesDialog] = useState(false);
  
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
      console.log('Loading doctor-specific data...');
      
      // Load patients from API with doctor-specific filtering
      try {
        console.log('🔥 Attempting to load patients for doctor:', user?.id);
        const patientsData = await api.patients.getPatients({ doctorId: user?.id });
        console.log('🔥 Raw API response for patients:', patientsData);
        console.log('🔥 Type of patientsData:', typeof patientsData);
        console.log('🔥 Is array?', Array.isArray(patientsData));
        
        // Handle different response formats from backend
        let patientsArray = [];
        if (Array.isArray(patientsData)) {
          patientsArray = patientsData;
        } else if (patientsData && patientsData.patients && Array.isArray(patientsData.patients)) {
          patientsArray = patientsData.patients;
        } else if (patientsData && patientsData.data && Array.isArray(patientsData.data)) {
          patientsArray = patientsData.data;
        } else if (patientsData && typeof patientsData === 'object') {
          // If it's a single patient object, wrap it in array
          patientsArray = [patientsData];
        }
        
        console.log('🔥 Extracted patients array:', patientsArray);
        console.log('🔥 Number of patients found:', patientsArray.length);
        
        // Transform API response to match expected format
        const transformedPatients = patientsArray.map((patient, index) => {
          console.log(`🔥 Transforming patient ${index + 1}:`, patient);
          
          const transformed = {
            id: patient._id || patient.id,
            name: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Name',
            mobile: patient.mobile || patient.mobileNumber || 'No mobile',
            email: patient.email || 'No email',
            age: patient.age || 'N/A',
            gender: patient.gender || 'Not specified',
            address: patient.address || 'Not provided',
            medicalHistory: patient.medicalHistory || 'No medical history recorded',
            lastVisit: patient.lastVisit || patient.createdAt || new Date().toISOString(),
            nextAppointment: patient.nextAppointment,
            type: (patient.campId ? 'camp' : 'clinic') as 'clinic' | 'camp',
            campId: patient.campId,
            visitHistory: patient.visitHistory || [],
            prescriptions: patient.prescriptions || []
          };
          
          console.log(`🔥 Transformed patient ${index + 1}:`, transformed);
          return transformed;
        });
        
        console.log('🔥 Final transformed patients:', transformedPatients);
        
        if (transformedPatients.length === 0) {
          console.log('🔥 No patients found, using sample data as fallback');
          setPatients(getSamplePatients());
          toast({
            title: "No Patients Found",
            description: "No patients found in database. Using sample data.",
            variant: "destructive",
          });
        } else {
          setPatients(transformedPatients);
          toast({
            title: "Real Patients Loaded Successfully! 🎉",
            description: `Successfully loaded ${transformedPatients.length} real patients from database`,
          });
        }
      } catch (patientError) {
        console.error('🔥 ERROR loading patients:', patientError);
        console.error('🔥 Error details:', patientError.message);
        console.error('🔥 Error stack:', patientError.stack);
        toast({
          title: "Patient Loading Failed",
          description: `Error: ${patientError.message}. Using offline mode.`,
          variant: "destructive",
        });
        // Use sample data as fallback
        setPatients(getSamplePatients());
      }

      // Load medicines from API
      try {
        const medicinesData = await api.medicines.getMedicines();
        console.log('Loaded medicines data:', medicinesData);
        setMedicines(Array.isArray(medicinesData) ? medicinesData : []);
      } catch (medicineError) {
        console.error('Error loading medicines:', medicineError);
        setMedicines(getSampleMedicines());
      }

      // Load camps from API
      console.log('Loading camps from API...');
      const campsData = await api.camps.getCamps();
      console.log('Raw camps data from API:', campsData);
      
      if (Array.isArray(campsData) && campsData.length > 0) {
        // Transform camps to ensure proper structure
        const transformedCamps = campsData.map(camp => ({
          ...camp,
          id: camp.id || camp._id,
          title: camp.title || camp.name || 'Untitled Camp',
          contactInfo: camp.contactInfo || camp.notes || camp.organizerContact || '',
          status: camp.status || 'planned'
        }));
        console.log('Transformed camps:', transformedCamps);
        setCamps(transformedCamps);
      } else {
        // Add sample camps for initial setup
        const sampleCamps = [
          {
            name: 'Free Health Camp - Anand',
            date: new Date('2025-09-25'),
            location: 'Anand Community Center',
            description: 'Free health checkup and consultation for villagers',
            organizer: 'Dr. Himanshu Sonagara',
            organizerContact: '9876543210',
            time: '9:00 AM',
            type: 'camp',
            expectedPatients: 100,
            notes: 'Dr. Himanshu - 9876543210'
          },
          {
            name: 'Eye Care Camp - Surat',
            date: new Date('2025-09-30'),
            location: 'Surat School Grounds',
            description: 'Eye examination and glasses distribution',
            organizer: 'Dr. Himanshu Sonagara',
            organizerContact: '9876543211',
            time: '10:00 AM',
            type: 'camp',
            expectedPatients: 50,
            notes: 'Contact: 9876543211'
          },
          {
            name: 'Health Checkup Camp - Delhi',
            date: new Date('2025-10-08'),
            location: 'Delhi Community Hall',
            description: 'Comprehensive health screening and vaccination',
            organizer: 'Dr. Himanshu Sonagara',
            organizerContact: '9876543212',
            time: '9:00 AM',
            type: 'camp',
            expectedPatients: 75,
            notes: 'Contact: 9876543212'
          },
          {
            name: 'Medical Camp - Mumbai',
            date: new Date('2025-10-06'),
            location: 'Mumbai Medical Center',
            description: 'General medical consultation and treatment',
            organizer: 'Dr. Himanshu Sonagara',
            organizerContact: '9876543213',
            time: '8:00 AM',
            type: 'camp',
            expectedPatients: 120,
            notes: 'Contact: 9876543213'
          }
        ];
        
        // Create sample camps in the database
        const createdCamps = [];
        for (const camp of sampleCamps) {
          const createdCamp = await api.camps.createCamp(camp);
          createdCamps.push(createdCamp);
        }
        
        // Transform and set the created camps
        const transformedCamps = createdCamps.map(camp => ({
          ...camp,
          id: camp.id || camp._id,
          title: camp.title || camp.name || 'Untitled Camp',
          contactInfo: camp.contactInfo || camp.notes || camp.organizerContact || '',
          status: camp.status || 'planned'
        }));
        setCamps(transformedCamps);
      }

      // Load appointments/bookings from API
      try {
        const response = await api.getAppointments();
        const appointmentsData = response.data || response || [];
        const formattedBookings = appointmentsData.map(appointment => ({
          id: appointment._id || appointment.id,
          patientName: appointment.patientName || appointment.patientId?.name || 'Unknown Patient',
          patientId: appointment.patientId?.patientId || appointment.patientId,
          date: formatDate(appointment.date),
          time: appointment.time,
          type: appointment.type,
          reason: appointment.reason,
          status: appointment.status
        })) || [];
        setBookings(formattedBookings);
        console.log('Loaded appointments:', formattedBookings);
      } catch (error) {
        console.error('Error loading appointments:', error);
        // Initialize as empty array if API fails
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

  // Assign random patients to camps for demonstration
  const assignPatientsToRandomCamps = () => {
    if (camps.length > 0 && patients.length > 0) {
      const updatedCamps = camps.map((camp, index) => {
        // Assign 2-4 random patients to each camp
        const numPatients = Math.floor(Math.random() * 3) + 2; // 2-4 patients
        const assignedPatients = [];
        
        for (let i = 0; i < Math.min(numPatients, patients.length); i++) {
          const randomPatient = patients[Math.floor(Math.random() * patients.length)];
          if (!assignedPatients.includes(randomPatient.id)) {
            assignedPatients.push(randomPatient.id);
          }
        }
        
        return {
          ...camp,
          patients: assignedPatients
        };
      });
      
      setCamps(updatedCamps);
    }
  };

  // Call this after camps and patients are loaded
  useEffect(() => {
    if (camps.length > 0 && patients.length > 0 && !camps.some(camp => camp.patients && camp.patients.length > 0)) {
      assignPatientsToRandomCamps();
    }
  }, [camps.length, patients.length]);

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
        email: newPatient.email || undefined, // Include email if provided
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
        message: `Dear Patient, A new health camp "${createdCamp.title}" has been organized on ${formatDate(createdCamp.date)} at ${createdCamp.location}. Please visit our clinic for more details. - Dr. Himanshu Sonagara, Shree Hari Clinic`
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

  const handlePrescriptionSuccess = () => {
    // Refresh patient data if needed
    loadData();
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

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      if (action === 'delete') {
        await api.deleteAppointment(bookingId);
        
        // Remove the booking from local state
        const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
        setBookings(updatedBookings);
        
        toast({ 
          title: "Appointment deleted successfully!",
          description: "The appointment has been permanently removed."
        });
      } else {
        const status = action === 'approve' ? 'approved' : 'rejected';
        await api.updateAppointmentStatus(bookingId, status);
        
        // Update local state
        const updatedBookings = bookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: status as 'approved' | 'rejected' }
            : booking
        );
        setBookings(updatedBookings);
        
        toast({ 
          title: `Booking ${action}d successfully!`,
          description: `The patient has been notified.`
        });
      }
    } catch (error) {
      console.error(`Error ${action === 'delete' ? 'deleting' : 'updating'} booking:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action === 'delete' ? 'delete' : action} booking. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const removePatient = async (id: string) => {
    console.log('Attempting to delete patient with ID:', id);
    
    try {
      // Call API to delete patient from database
      console.log('Making API call to delete patient...');
      const response = await api.patients.deletePatient(id);
      console.log('API delete response:', response);
      
      // Update local state only after successful API call
      const updatedPatients = patients.filter(p => p.id !== id);
      setPatients(updatedPatients);
      
      // Update localStorage to reflect the changes
      localStorage.setItem('doctor_patients', JSON.stringify(updatedPatients));
      
      toast({ 
        title: "Patient removed successfully!",
        description: "The patient has been permanently deleted from the database."
      });
      
      // Reload data to ensure consistency
      console.log('Patient deletion successful, reloading data...');
      setTimeout(() => {
        loadData();
      }, 1000);
      
    } catch (error) {
      console.error('Error removing patient:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      
      toast({
        title: "Failed to delete patient",
        description: `Error: ${errorMessage}. Check console for details.`,
        variant: "destructive"
      });
      
      // If the patient doesn't exist in the database anymore, remove it from local state anyway
      if (error.response?.status === 404) {
        console.log('Patient not found (404), removing from local state');
        const updatedPatients = patients.filter(p => p.id !== id);
        setPatients(updatedPatients);
        localStorage.setItem('doctor_patients', JSON.stringify(updatedPatients));
      }
    }
  };

  const removeMedicine = async (id: string) => {
    console.log('Attempting to delete medicine with ID:', id);
    
    try {
      // Call API to delete medicine from database
      console.log('Making API call to delete medicine...');
      const response = await api.medicines.deleteMedicine(id);
      console.log('API delete response:', response);
      
      // Update local state only after successful API call
      const updatedMedicines = medicines.filter(m => m.id !== id);
      setMedicines(updatedMedicines);
      
      // Update localStorage to reflect the changes
      localStorage.setItem('doctor_medicines', JSON.stringify(updatedMedicines));
      
      toast({ 
        title: "Medicine removed successfully!",
        description: "The medicine has been permanently deleted from the database."
      });
      
      // Reload data to ensure consistency
      console.log('Medicine deletion successful, reloading data...');
      setTimeout(() => {
        loadData();
      }, 1000);
      
    } catch (error) {
      console.error('Error removing medicine:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      
      toast({
        title: "Failed to delete medicine",
        description: `Error: ${errorMessage}. Check console for details.`,
        variant: "destructive"
      });
      
      // If the medicine doesn't exist in the database anymore, remove it from local state anyway
      if (error.response?.status === 404) {
        console.log('Medicine not found (404), removing from local state');
        const updatedMedicines = medicines.filter(m => m.id !== id);
        setMedicines(updatedMedicines);
        localStorage.setItem('doctor_medicines', JSON.stringify(updatedMedicines));
      }
    }
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    const medicine = medicines.find(m => m.id === medicineId);
    const medicineName = medicine?.name || 'this medicine';
    
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${medicineName}"?\n\nThis action cannot be undone and will permanently remove the medicine from the database.`
    );
    
    if (isConfirmed) {
      await removeMedicine(medicineId);
    }
  };

  const removeCamp = async (id: string) => {
    console.log('Attempting to delete camp with ID:', id);
    
    try {
      // Call API to delete camp from database
      console.log('Making API call to delete camp...');
      const response = await api.camps.deleteCamp(id);
      console.log('API delete response:', response);
      
      // Update local state only after successful API call
      const updatedCamps = camps.filter(c => c.id !== id);
      setCamps(updatedCamps);
      
      // Update localStorage to reflect the changes
      localStorage.setItem('doctor_camps', JSON.stringify(updatedCamps));
      
      toast({ 
        title: "Camp removed successfully!",
        description: "The camp has been permanently deleted from the database."
      });
      
      // Optionally reload data from server to ensure consistency
      console.log('Camp deletion successful, reloading data...');
      setTimeout(() => {
        loadData();
      }, 1000);
      
    } catch (error) {
      console.error('Error removing camp:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Handle different error scenarios
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      
      toast({
        title: "Failed to delete camp",
        description: `Error: ${errorMessage}. Check console for details.`,
        variant: "destructive"
      });
      
      // If the camp doesn't exist in the database anymore, remove it from local state anyway
      if (error.response?.status === 404) {
        console.log('Camp not found (404), removing from local state');
        const updatedCamps = camps.filter(c => c.id !== id);
        setCamps(updatedCamps);
        localStorage.setItem('doctor_camps', JSON.stringify(updatedCamps));
      }
    }
  };

  const viewCampPatients = (camp: Camp) => {
    setSelectedCampForPatients(camp);
    setShowCampPatientsDialog(true);
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
    setShowImportMedicinesDialog(true);
  };

  const fetchMedicines = async () => {
    try {
      const medicinesData = await api.medicines.getMedicines();
      console.log('Loaded medicines data:', medicinesData);
      setMedicines(Array.isArray(medicinesData) ? medicinesData : []);
    } catch (medicineError) {
      console.error('Error loading medicines:', medicineError);
      toast({
        title: "Error loading medicines",
        description: "Failed to load medicines from server",
        variant: "destructive"
      });
    }
  };

  const handleImportSuccess = async () => {
    // Refresh medicines after successful import
    await fetchMedicines();
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
    <h2 className="text-xl font-bold text-medica">
      {/* Add any additional doctor info here if needed */}
    </h2>
  </div>
</div>
</div>
</Card>
{/* Tabs Section - Mobile Responsive */}
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 pb-2">
    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto p-1 gap-1">
      <TabsTrigger value="dashboard" className="text-xs sm:text-sm px-2 py-2">
        <span className="hidden sm:inline">Dashboard</span>
        <span className="sm:hidden">Home</span>
      </TabsTrigger>
      <TabsTrigger value="patients" className="text-xs sm:text-sm px-2 py-2">
        Patients
      </TabsTrigger>
      <TabsTrigger value="bookings" className="text-xs sm:text-sm px-2 py-2">
        Bookings
      </TabsTrigger>
      <TabsTrigger value="inventory" className="text-xs sm:text-sm px-2 py-2">
        <span className="hidden sm:inline">Inventory</span>
        <span className="sm:hidden">Meds</span>
      </TabsTrigger>
      <TabsTrigger value="camps" className="text-xs sm:text-sm px-2 py-2">
        Camps
      </TabsTrigger>
      <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 py-2 col-span-2 sm:col-span-1">
        <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
        <span className="hidden sm:inline">Notifications</span>
        <span className="sm:hidden">Alerts</span>
      </TabsTrigger>
    </TabsList>
  </div>

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
              removeMedicine={handleDeleteMedicine}
              exportExpiringMedicines={exportExpiringMedicines}
              importMedicines={importMedicines}
            />
          </TabsContent>

          {/* Camps Tab */}
          <TabsContent value="camps" className="space-y-6">
            <Camps
              camps={camps}
              setShowCampDialog={setShowCampDialog}
              viewCampPatients={viewCampPatients}
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
          selectedPatient={selectedPatientHistory as any}
          onSuccess={handlePrescriptionSuccess}
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

        {/* Camp Patients Dialog */}
        <CampPatientsDialog
          isOpen={showCampPatientsDialog}
          onClose={() => setShowCampPatientsDialog(false)}
          camp={selectedCampForPatients}
          allPatients={patients}
        />

        {/* Import Medicines Dialog */}
        <ImportMedicinesDialog
          isOpen={showImportMedicinesDialog}
          onClose={() => setShowImportMedicinesDialog(false)}
          onImportSuccess={handleImportSuccess}
        />
      </div>
    </Layout>
  );
}
