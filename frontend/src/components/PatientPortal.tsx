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
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: 'p1',
      prescribedDate: '2024-01-15',
      doctorName: 'Dr. Himanshu Sonagara',
      instructions: 'Take prescribed medicines as directed. Maintain good hygiene and follow the diet chart. Avoid oily and spicy foods. Drink plenty of water. Rest properly and avoid stress.',
      nextVisitDate: '2024-01-30',
      priority: 'high',
      type: 'current',
      status: 'active'
    },
    {
      id: 'p2',
      prescribedDate: '2023-12-20',
      doctorName: 'Dr. Himanshu Sonagara',
      instructions: 'Continue with the homeopathic treatment. Apply the prescribed ointment twice daily. Keep the affected area clean and dry. Avoid tight clothing.',
      nextVisitDate: '2024-01-05',
      priority: 'medium',
      type: 'past',
      status: 'completed'
    }
  ]);
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
      // For now, initialize with empty arrays since the patient-specific APIs need to be implemented
      // Later these will fetch data based on current patient ID from authentication context
      
      setAppointments([]);
      setPrescriptions([]);
      setAlerts([]);
      setReports([]);
      
      // Load camps from API (these are public/shared data)
      const campsData = await api.camps.getCamps();
      setCamps(Array.isArray(campsData) ? campsData : []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data from server",
        variant: "destructive",
      });
      
      // Fallback to empty arrays if API fails
      setAppointments([]);
      setPrescriptions([]);
      setCamps([]);
      setAlerts([]);
      setReports([]);
    }
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

    try {
      // Create appointment via API
      const appointmentData = {
        appointmentDate: formattedDate,
        appointmentTime: newAppointment.timeSlot,
        appointmentType: newAppointment.type,
        reasonForVisit: newAppointment.reason,
        notes: `Booked by patient on ${new Date().toLocaleDateString()}`
      };

      console.log('📝 Booking appointment:', appointmentData);

      const response = await api.appointments.createAppointment(appointmentData);

      if (response.success) {
        console.log('✅ Appointment booked successfully:', response.data);

        // Update local state with the new appointment
        const slotNumber = 5 - availableSlots + 1;
        const appointment: Appointment = {
          id: response.data.appointment._id,
          date: formattedDate,
          time: newAppointment.timeSlot,
          type: newAppointment.type,
          reason: newAppointment.reason,
          status: 'pending',
          slotNumber
        };

        const updatedAppointments = [...appointments, appointment];
        setAppointments(updatedAppointments);
        localStorage.setItem('patient_appointments', JSON.stringify(updatedAppointments));

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
          title: "Appointment Booked",
          description: `Your appointment has been scheduled for ${format(selectedDate, 'PPP')} at ${newAppointment.timeSlot}`,
        });

        // Reset form
        setNewAppointment({ type: '', reason: '', timeSlot: '' });
        setSelectedDate(new Date());
        setShowBookDialog(false);
      } else {
        throw new Error(response.message || 'Failed to book appointment');
      }
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
