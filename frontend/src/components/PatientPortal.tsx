import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar as CalendarIcon, Heart, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { api } from '@/lib/api';

// Modular Components
import Appointments from './PatientPortal/Appointments';
import Medicines from './PatientPortal/Medicines';
import Camps from './PatientPortal/Camps';
import Reports from './PatientPortal/Reports';
import BookAppointmentDialog from './PatientPortal/BookAppointmentDialog';
import AlertsDialog from './PatientPortal/AlertsDialog';

// Interfaces
interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  cancelReason?: string;
  slotNumber?: number;
}

interface Prescription {
  id: string;
  prescribedDate: string;
  doctorName: string;
  instructions: string;
  nextVisitDate?: string;
  priority: 'high' | 'medium' | 'low';
  type: 'current' | 'past';
  status: 'active' | 'completed';
}

interface Camp {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  organizer: string;
  description: string;
  type: string;
  capacity: number;
  registered: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface Alert {
  id: string;
  type: 'appointment' | 'medicine' | 'camp' | 'report' | 'general';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface Report {
  id: string;
  type: string;
  title: string;
  date: string;
  doctor: string;
  description?: string;
  fileUrl?: string;
  status: 'available' | 'pending' | 'processing';
  [key: string]: unknown;
}

export default function PatientPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State Management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [doctorSpecialization, setDoctorSpecialization] = useState('allopathy');
  
  // Dialog States
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  
  // Appointment Booking States
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newAppointment, setNewAppointment] = useState({
    type: '',
    reason: '',
    timeSlot: ''
  });
  const [slotAvailability, setSlotAvailability] = useState<{[key: string]: number}>({});

  // Time slots configuration
  const timeSlots = useMemo(() => [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM'
  ], []);

  // Initialize data on component mount
  useEffect(() => {
    loadData();
    // Listen for camp notifications
    const handleCampNotification = (event: CustomEvent) => {
      const campData = event.detail;
      setAlerts(prev => [...prev, {
        id: `camp_${Date.now()}`,
        type: 'camp',
        title: 'New Camp Added',
        message: `${campData.title} has been scheduled at ${campData.location}`,
        time: new Date().toLocaleTimeString(),
        read: false,
        priority: 'high'
      }]);
      toast({
        title: "New Camp Notification",
        description: `${campData.title} has been added by Dr. Himanshu Sonagara`,
      });
    };

    window.addEventListener('campAdded', handleCampNotification as EventListener);
    return () => window.removeEventListener('campAdded', handleCampNotification as EventListener);
  }, [toast]);

  // Check available slots function
  const checkAvailableSlots = useCallback((date: Date, timeSlot: string) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const bookedCount = appointments.filter(apt => 
      apt.date === formattedDate && 
      apt.time === timeSlot && 
      apt.status !== 'cancelled'
    ).length;
    return Math.max(0, 5 - bookedCount); // Max 5 slots per time
  }, [appointments]);

  // Update slot availability when date or appointments change
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const availability: {[key: string]: number} = {};
      
      timeSlots.forEach(slot => {
        const key = `${formattedDate}_${slot}`;
        availability[key] = checkAvailableSlots(selectedDate, slot);
      });
      
      setSlotAvailability(availability);
    }
  }, [selectedDate, appointments, checkAvailableSlots, timeSlots]);

  // Set doctor specialization based on latest appointment
  useEffect(() => {
    if (appointments.length > 0) {
      const latest = appointments[appointments.length - 1];
      if (latest) {
        if (latest.type && (latest.type.toLowerCase().includes('homeopathy') || latest.type.toLowerCase().includes('constitutional'))) {
          setDoctorSpecialization('homeopathy');
        } else {
          if (latest.type && latest.type.toLowerCase().includes('homeo')) {
            setDoctorSpecialization('homeopathy');
          } else {
            setDoctorSpecialization('allopathy');
          }
        }
      }
    }
  }, [appointments]);

  // Load data from API
  const loadData = async () => {
    try {
      // Load appointments for the current patient
      const appointmentsData = await api.getAppointments();
      if (Array.isArray(appointmentsData) && appointmentsData.length > 0) {
        const formattedAppointments = appointmentsData.map((apt: any) => ({
          id: apt._id || apt.id,
          date: apt.date,
          time: apt.time,
          type: apt.type,
          reason: apt.reason,
          status: apt.status || 'pending',
          slotNumber: apt.slotNumber
        }));
        setAppointments(formattedAppointments);
      }

      // Load prescriptions for the current patient
      try {
        const prescriptionsData = await api.prescriptions.getMyPrescriptions();
        if (prescriptionsData && prescriptionsData.data && Array.isArray(prescriptionsData.data.prescriptions)) {
          setPrescriptions(prescriptionsData.data.prescriptions);
        }
      } catch (prescError) {
        console.warn('Failed to load prescriptions:', prescError);
        // Use sample data as fallback for prescriptions
        const samplePrescriptions: Prescription[] = [
          {
            id: 'pres_001',
            prescribedDate: '2025-09-28',
            doctorName: 'Dr. Himanshu Sonagara',
            instructions: 'Take Paracetamol 500mg twice daily after meals for fever and headache. Monitor temperature daily. Stay hydrated and get adequate rest. Return if fever persists beyond 3 days or if temperature exceeds 102°F.',
            nextVisitDate: '2025-10-05',
            priority: 'medium',
            type: 'current',
            status: 'active'
          }
        ];
        setPrescriptions(samplePrescriptions);
        console.warn('Using sample prescription data due to API error');
      }
      
      // Load camps from API (these are public/shared data)
      try {
        const campsData = await api.camps.getCamps();
        if (Array.isArray(campsData) && campsData.length > 0) {
          setCamps(campsData);
        }
      } catch (campError) {
        console.warn('Failed to load camps from API, using sample data');
      }
      
      // Always initialize sample data if no real data is available
      if (appointments.length === 0 && prescriptions.length === 0) {
        initializeSampleData();
      }
      
    } catch (error) {
      console.error('Error loading data from server:', error);
      
      // Show a user-friendly message about offline mode
      toast({
        title: "Working Offline",
        description: "Loading sample data for demonstration. Connect to server for real data.",
        variant: "default",
      });
      
      // Initialize with sample data when API fails
      initializeSampleData();
    }
  };

  // Initialize sample data for patient portal
  const initializeSampleData = () => {
    // Sample appointments
    const sampleAppointments: Appointment[] = [
      {
        id: 'apt_001',
        date: '2025-10-05',
        time: '10:00 AM',
        type: 'consultation',
        reason: 'Regular checkup',
        status: 'approved'
      },
      {
        id: 'apt_002',
        date: '2025-09-28',
        time: '02:30 PM',
        type: 'follow-up',
        reason: 'Blood pressure monitoring',
        status: 'completed'
      },
      {
        id: 'apt_003',
        date: '2025-10-12',
        time: '11:30 AM',
        type: 'consultation',
        reason: 'Skin condition review',
        status: 'pending'
      }
    ];

    // Sample prescriptions with detailed doctor notes
    const samplePrescriptions: Prescription[] = [
      {
        id: 'pres_001',
        prescribedDate: '2025-09-28',
        doctorName: 'Dr. Himanshu Sonagara',
        instructions: 'Take Paracetamol 500mg twice daily after meals for fever and headache. Monitor temperature daily. Stay hydrated and get adequate rest. Return if fever persists beyond 3 days or if temperature exceeds 102°F.',
        nextVisitDate: '2025-10-05',
        priority: 'medium',
        type: 'current',
        status: 'active'
      },
      {
        id: 'pres_002',
        prescribedDate: '2025-09-15',
        doctorName: 'Dr. Himanshu Sonagara',
        instructions: 'Complete the 7-day course of Amoxicillin 250mg three times daily. Take probiotics to maintain gut health. Avoid alcohol during treatment. Follow up if symptoms worsen or new symptoms appear.',
        priority: 'high',
        type: 'past',
        status: 'completed'
      },
      {
        id: 'pres_003',
        prescribedDate: '2025-09-20',
        doctorName: 'Dr. Himanshu Sonagara',
        instructions: 'Apply prescribed ointment twice daily on affected areas. Keep the area clean and dry. Wear loose cotton clothing. Avoid scratching. Use the medication for full 10 days even if symptoms improve.',
        nextVisitDate: '2025-10-12',
        priority: 'medium',
        type: 'current',
        status: 'active'
      }
    ];

    // Sample camps
    const sampleCamps: Camp[] = [
      {
        id: 'camp_001',
        title: 'Free Health Camp - Anand',
        location: 'Anand Community Center',
        date: '2025-10-22',
        time: '09:00 AM',
        organizer: 'Dr. Himanshu Sonagara',
        description: 'Free health checkup and consultation for villagers. Blood pressure, diabetes screening, and general consultation available.',
        type: 'health',
        capacity: 100,
        registered: 25,
        status: 'upcoming'
      },
      {
        id: 'camp_002',
        title: 'Eye Care Camp - Surat',
        location: 'Surat School Grounds',
        date: '2025-10-08',
        time: '10:00 AM',
        organizer: 'Dr. Himanshu Sonagara',
        description: 'Eye examination and glasses distribution. Free eye checkup for all ages.',
        type: 'eye-care',
        capacity: 50,
        registered: 12,
        status: 'upcoming'
      },
      {
        id: 'camp_003',
        title: 'Health Checkup Camp - Delhi',
        location: 'Delhi Community Hall',
        date: '2025-10-08',
        time: '09:00 AM',
        organizer: 'Dr. Himanshu Sonagara',
        description: 'Comprehensive health screening and vaccination drive.',
        type: 'screening',
        capacity: 75,
        registered: 18,
        status: 'upcoming'
      }
    ];

    // Sample reports
    const sampleReports: Report[] = [
      {
        id: 'rep_001',
        title: 'Blood Test Report',
        date: '2025-09-25',
        type: 'lab',
        doctor: 'Dr. Himanshu Sonagara',
        description: 'Complete blood count and lipid profile results',
        status: 'available'
      },
      {
        id: 'rep_002',
        title: 'X-Ray Chest',
        date: '2025-09-15',
        type: 'radiology',
        doctor: 'Dr. Himanshu Sonagara',
        description: 'Chest X-ray examination for respiratory assessment',
        status: 'available'
      }
    ];

    // Sample alerts
    const sampleAlerts: Alert[] = [
      {
        id: 'alert_001',
        type: 'appointment',
        title: 'Upcoming Appointment',
        message: 'You have an appointment scheduled for October 5th at 10:00 AM',
        time: new Date().toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: 'alert_002',
        type: 'camp',
        title: 'New Health Camp',
        message: 'Free Health Camp organized on October 8th at Surat School Grounds',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'medium'
      }
    ];

    // Set all sample data
    setAppointments(sampleAppointments);
    setPrescriptions(samplePrescriptions);
    setCamps(sampleCamps);
    setReports(sampleReports);
    setAlerts(sampleAlerts);

    console.log('Initialized with sample data for patient portal');
  };

  // Book appointment function
  const bookAppointment = async () => {
    if (!selectedDate || !newAppointment.type || !newAppointment.reason || !newAppointment.timeSlot) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const availableSlots = checkAvailableSlots(selectedDate, newAppointment.timeSlot);
      
      if (availableSlots === 0) {
        toast({
          title: "Slot Unavailable",
          description: "This time slot is fully booked. Please select another time.",
          variant: "destructive"
        });
        return;
      }

      // Create appointment via API
      const appointmentData = {
        date: formattedDate,
        timeSlot: newAppointment.timeSlot,
        type: newAppointment.type,
        reason: newAppointment.reason,
      };

      const response = await api.createAppointment(appointmentData);
      
      // Add to local state
      const newAppointmentObj: Appointment = {
        id: response.id || Date.now().toString(),
        date: formattedDate,
        time: newAppointment.timeSlot,
        type: newAppointment.type,
        reason: newAppointment.reason,
        status: 'pending',
        slotNumber: 5 - availableSlots + 1
      };

      const updatedAppointments = [...appointments, newAppointmentObj];
      setAppointments(updatedAppointments);

      // Add notification
      const newAlert: Alert = {
        id: `appointment_${Date.now()}`,
        type: 'appointment',
        title: 'Appointment Booked',
        message: `Your ${newAppointment.type} appointment has been scheduled for ${formattedDate} at ${newAppointment.timeSlot}`,
        time: new Date().toLocaleTimeString(),
        read: false,
        priority: 'medium'
      };
      const updatedAlerts = [...alerts, newAlert];
      setAlerts(updatedAlerts);
      localStorage.setItem('patient_alerts', JSON.stringify(updatedAlerts));

      toast({
        title: "Appointment Booked Successfully",
        description: `Your appointment has been scheduled for ${format(selectedDate, 'PPP')} at ${newAppointment.timeSlot}`,
      });

      // Reset form
      setNewAppointment({ type: '', reason: '', timeSlot: '' });
      setSelectedDate(new Date());
      setShowBookDialog(false);
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Cancel appointment function
  const cancelAppointment = (appointmentId: string) => {
    const updatedAppointments = appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, status: 'cancelled' as const, cancelReason: 'Cancelled by patient' }
        : apt
    );
    setAppointments(updatedAppointments);
    localStorage.setItem('patient_appointments', JSON.stringify(updatedAppointments));

    toast({
      title: "Appointment Cancelled",
      description: "Your appointment has been cancelled successfully",
    });
  };

  // Register for camp function
  const registerForCamp = (campId: string) => {
    const updatedCamps = camps.map(camp => 
      camp.id === campId 
        ? { ...camp, registered: camp.registered + 1 }
        : camp
    );
    setCamps(updatedCamps);
    localStorage.setItem('doctor_camps', JSON.stringify(updatedCamps));

    const camp = camps.find(c => c.id === campId);
    if (camp) {
      const newAlert: Alert = {
        id: `camp_registration_${Date.now()}`,
        type: 'camp',
        title: 'Camp Registration Successful',
        message: `You have successfully registered for ${camp.title} at ${camp.location}`,
        time: new Date().toLocaleTimeString(),
        read: false,
        priority: 'high'
      };
      const updatedAlerts = [...alerts, newAlert];
      setAlerts(updatedAlerts);
      localStorage.setItem('patient_alerts', JSON.stringify(updatedAlerts));

      toast({
        title: "Registration Successful",
        description: `You have been registered for ${camp.title}`,
      });
    }
  };

  // Mark alert as read
  const markAsRead = (alertId: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('patient_alerts', JSON.stringify(updatedAlerts));
  };

  // Delete alert
  const deleteAlert = (alertId: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
    setAlerts(updatedAlerts);
    localStorage.setItem('patient_alerts', JSON.stringify(updatedAlerts));
  };

  const unreadAlerts = alerts.filter(alert => !alert.read);

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patient Portal</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowAlerts(true)}
                className="relative"
                size="sm"
              >
                <Bell className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Alerts</span>
                {unreadAlerts.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {unreadAlerts.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.filter(a => a.status === 'pending').length}</div>
              <p className="text-xs text-muted-foreground">Pending appointments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Medicines</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{prescriptions.filter(p => p.type === 'current').length}</div>
              <p className="text-xs text-muted-foreground">Current prescriptions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Camps</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{camps.filter(c => c.status === 'upcoming').length}</div>
              <p className="text-xs text-muted-foreground">Upcoming health camps</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadAlerts.length}</div>
              <p className="text-xs text-muted-foreground">Unread alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="appointments" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Appointments</span>
              <span className="sm:hidden">Appts</span>
            </TabsTrigger>
            <TabsTrigger value="medicines" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Medicines</span>
              <span className="sm:hidden">Meds</span>
            </TabsTrigger>
            <TabsTrigger value="camps" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Health Camps</span>
              <span className="sm:hidden">Camps</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4 sm:space-y-6">
            <Appointments
              appointments={appointments}
              setShowBookDialog={setShowBookDialog}
              cancelAppointment={cancelAppointment}
            />
          </TabsContent>

          <TabsContent value="medicines" className="space-y-4 sm:space-y-6">
            <Medicines prescriptions={prescriptions} />
          </TabsContent>

          <TabsContent value="camps" className="space-y-4 sm:space-y-6">
            <Camps camps={camps} registerForCamp={registerForCamp} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4 sm:space-y-6">
            <Reports reports={reports} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <BookAppointmentDialog
        isOpen={showBookDialog}
        onOpenChange={setShowBookDialog}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        newAppointment={newAppointment}
        setNewAppointment={setNewAppointment}
        slotAvailability={slotAvailability}
        timeSlots={timeSlots}
        bookAppointment={bookAppointment}
        doctorSpecialization={doctorSpecialization}
      />

      <AlertsDialog
        isOpen={showAlerts}
        onOpenChange={setShowAlerts}
        alerts={alerts}
        markAsRead={markAsRead}
        deleteAlert={deleteAlert}
      />
    </div>
  );
}
