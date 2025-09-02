import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  Calendar as CalendarIcon, 
  Pill, 
  FileText, 
  Bell, 
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Edit,
  MapPin,
  Stethoscope,
  Heart,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  priority: 'high' | 'medium' | 'low';
  type: 'current' | 'past';
  remainingDays: number;
}

interface Camp {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time?: string;
  organizer?: string;
  contactInfo?: string;
  status: 'planned' | 'ongoing' | 'completed';
  patients?: string[];
}

interface Alert {
  id: string;
  type: 'medicine' | 'appointment' | 'camp' | 'general';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export function PatientPortal() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  
  const [newAppointment, setNewAppointment] = useState({
    type: '',
    reason: '',
    timeSlot: ''
  });
  const [slotAvailability, setSlotAvailability] = useState<{[key: string]: number}>({}); // Format: "date_time": availableSlots
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

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
  }, []);

  const loadData = () => {
    // Load saved data from localStorage
    const savedAppointments = localStorage.getItem('patient_appointments');
    const savedMedicines = localStorage.getItem('patient_medicines');
    const savedCamps = localStorage.getItem('doctor_camps'); // Load doctor's camps
    const savedAlerts = localStorage.getItem('patient_alerts');

    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
    if (savedMedicines) {
      setMedicines(JSON.parse(savedMedicines));
    }
    if (savedCamps) {
      setCamps(JSON.parse(savedCamps));
    }
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }

    // Add some default data if none exists
    if (!savedMedicines) {
      const defaultMedicines: Medicine[] = [
        {
          id: '1',
          name: 'Arnica 30C',
          dosage: '3 pellets',
          frequency: 'Twice daily',
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          priority: 'high',
          type: 'current',
          remainingDays: 12
        },
        {
          id: '2',
          name: 'Belladonna 200C',
          dosage: '5 pellets',
          frequency: 'Once daily',
          startDate: '2023-12-01',
          endDate: '2023-12-31',
          priority: 'medium',
          type: 'past',
          remainingDays: 0
        }
      ];
      setMedicines(defaultMedicines);
      localStorage.setItem('patient_medicines', JSON.stringify(defaultMedicines));
    }
  };

  // Check available slots for a given date and time
  const checkAvailableSlots = (date: Date | undefined, timeSlot: string) => {
    if (!date) return 0;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    const key = `${formattedDate}_${timeSlot}`;
    
    // Count existing bookings for this time slot
    const bookedSlots = appointments.filter(
      apt => apt.date === formattedDate && apt.time === timeSlot && 
      (apt.status === 'pending' || apt.status === 'approved')
    ).length;
    
    // Return available slots
    return MAX_SLOTS_PER_TIME - bookedSlots;
  };

  // Check if the selected date/time is valid (not same day and at least 24 hours in advance)
  const isValidBookingTime = (date: Date | undefined) => {
    if (!date) return false;
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    // Check if selected date is at least tomorrow
    return date >= tomorrow;
  };
  
  // Update available slots whenever selected date changes
  useEffect(() => {
    if (selectedDate) {
      const availability: {[key: string]: number} = {};
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Calculate availability for each time slot
      timeSlots.forEach(slot => {
        const key = `${formattedDate}_${slot}`;
        availability[key] = checkAvailableSlots(selectedDate, slot);
      });
      
      setSlotAvailability(availability);
    }
  }, [selectedDate, appointments]);

  const bookAppointment = () => {
    if (!selectedDate || !newAppointment.type || !newAppointment.reason || !newAppointment.timeSlot) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Validate booking time (not same day and at least 24 hours in advance)
    if (!isValidBookingTime(selectedDate)) {
      toast({
        title: "Invalid Booking Time",
        description: "Appointments must be booked at least 24 hours in advance",
        variant: "destructive"
      });
      return;
    }
    
    // Check if slots are available
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const key = `${formattedDate}_${newAppointment.timeSlot}`;
    const availableSlots = slotAvailability[key] || 0;
    
    if (availableSlots <= 0) {
      toast({
        title: "No Slots Available",
        description: "This time slot is fully booked. Please select another time.",
        variant: "destructive"
      });
      return;
    }
    
    // Assign a slot number
    const bookedSlots = appointments.filter(
      apt => apt.date === formattedDate && apt.time === newAppointment.timeSlot && 
      (apt.status === 'pending' || apt.status === 'approved')
    ).map(apt => apt.slotNumber);
    
    // Find first available slot number
    let slotNumber = 1;
    while (bookedSlots.includes(slotNumber) && slotNumber <= MAX_SLOTS_PER_TIME) {
      slotNumber++;
    }

    const appointment: Appointment = {
      id: `apt_${Date.now()}`,
      date: formattedDate,
      time: newAppointment.timeSlot,
      type: newAppointment.type,
      reason: newAppointment.reason,
      status: 'pending',
      slotNumber: slotNumber
    };

    const updatedAppointments = [...appointments, appointment];
    setAppointments(updatedAppointments);
    localStorage.setItem('patient_appointments', JSON.stringify(updatedAppointments));

    // Notify doctor dashboard
    const doctorBookings = JSON.parse(localStorage.getItem('doctor_bookings') || '[]');
    doctorBookings.push({
      ...appointment,
      patientName: 'Current Patient', // In real app, get from user context
      patientId: 'current_patient'
    });
    localStorage.setItem('doctor_bookings', JSON.stringify(doctorBookings));

    toast({
      title: "Appointment Booked",
      description: "Your appointment request has been sent to Dr. Himanshu Sonagara"
    });

    setNewAppointment({ type: '', reason: '', timeSlot: '' });
    setShowCalendar(false);
  };

  const cancelAppointment = (appointmentId: string, reason: string) => {
    const updatedAppointments = appointments.map(apt =>
      apt.id === appointmentId 
        ? { ...apt, status: 'cancelled' as const, cancelReason: reason }
        : apt
    );
    setAppointments(updatedAppointments);
    localStorage.setItem('patient_appointments', JSON.stringify(updatedAppointments));

    toast({
      title: "Appointment Cancelled",
      description: "Your appointment has been cancelled successfully"
    });
  };


  const deleteMedicineReminder = (medicineId: string) => {
    const updatedMedicines = medicines.filter(med => med.id !== medicineId);
    setMedicines(updatedMedicines);
    localStorage.setItem('patient_medicines', JSON.stringify(updatedMedicines));

    toast({
      title: "Reminder Deleted",
      description: "Medicine reminder has been removed"
    });
  };

  const markAlertAsRead = (alertId: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, read: true } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('patient_alerts', JSON.stringify(updatedAlerts));
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM'
  ];
  
  // Maximum slots available per time slot
  const MAX_SLOTS_PER_TIME = 5;

  const currentMedicines = medicines.filter(med => med.type === 'current');
  const pastMedicines = medicines.filter(med => med.type === 'past');
  const unreadAlerts = alerts.filter(alert => !alert.read);

  // Reports Section Component
  const ReportsSection = () => {
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
      const savedReports = localStorage.getItem('patient_reports');
      if (savedReports) {
        setReports(JSON.parse(savedReports));
      }
    }, []);

    if (reports.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No medical reports available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="p-4 bg-white/50 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary">{report.type}</Badge>
                  <span className="font-semibold text-medical-dark">{report.title}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Date: {report.date}</p>
                {report.description && (
                  <p className="text-sm mt-1">{report.description}</p>
                )}
                {report.fileName && (
                  <p className="text-sm text-blue-600 mt-1">File: {report.fileName}</p>
                )}
              </div>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-full shadow-glow">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-medical-dark">Patient Portal</h1>
              <p className="text-primary font-semibold">Shree Hari Clinic</p>
            </div>
          </div>
          <p className="text-muted-foreground">
            Dr. Himanshu Sonagara (B.H.M.S) • Reg. No: G - 28048
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-medical transition-all hover:-translate-y-1 bg-gradient-card border-0" 
                onClick={() => setShowCalendar(true)}>
            <CardContent className="p-6 text-center">
              <CalendarIcon className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-medical-dark">Appointments</h3>
              <p className="text-sm text-muted-foreground mt-1">Book & Manage</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-medical transition-all hover:-translate-y-1 bg-gradient-card border-0"
                onClick={() => {
                  const medicinesTab = document.querySelector('[value="medicines"]');
                  if (medicinesTab) {
                    (medicinesTab as HTMLElement).click();
                  }
                }}>
            <CardContent className="p-6 text-center">
              <Pill className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-medical-dark">Medicines</h3>
              <p className="text-sm text-muted-foreground mt-1">{currentMedicines.length} Active</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-medical transition-all hover:-translate-y-1 bg-gradient-card border-0"
                onClick={() => setShowAlerts(true)}>
            <CardContent className="p-6 text-center relative">
              <Bell className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-medical-dark">Alerts</h3>
              <p className="text-sm text-muted-foreground mt-1">{unreadAlerts.length} New</p>
              {unreadAlerts.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">
                  {unreadAlerts.length}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-medical transition-all hover:-translate-y-1 bg-gradient-card border-0"
                onClick={() => {
                  const reportsTab = document.querySelector('[value="reports"]');
                  if (reportsTab) {
                    (reportsTab as HTMLElement).click();
                  }
                }}>
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-medical-dark">Reports</h3>
              <p className="text-sm text-muted-foreground mt-1">Medical History</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="medicines">Medicines</TabsTrigger>
            <TabsTrigger value="camps">Health Camps</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-medical">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-medical-dark">My Appointments</CardTitle>
                <Button onClick={() => setShowCalendar(true)} variant="medical" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Book New
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No appointments scheduled</p>
                    </div>
                  ) : (
                    appointments.map((appointment) => (
                      <Card key={appointment.id} className="p-4 bg-white/50 border-l-4 border-l-primary">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant={
                                appointment.status === 'approved' ? 'default' :
                                appointment.status === 'pending' ? 'secondary' :
                                appointment.status === 'rejected' ? 'destructive' :
                                appointment.status === 'cancelled' ? 'outline' : 'default'
                              }>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                              <span className="font-semibold text-medical-dark">{appointment.type}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{appointment.date} at {appointment.time} {appointment.slotNumber ? `(Slot ${appointment.slotNumber})` : ''}</p>
                            <p className="text-sm mt-1">{appointment.reason}</p>
                            {appointment.cancelReason && (
                              <p className="text-sm text-red-600 mt-1">Cancelled: {appointment.cancelReason}</p>
                            )}
                          </div>
                          {appointment.status === 'pending' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Cancel Appointment</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Label>Reason for cancellation</Label>
                                  <Textarea 
                                    placeholder="Please provide reason for cancellation..."
                                    onChange={(e) => {
                                      const reason = e.target.value;
                                      if (reason.trim()) {
                                        cancelAppointment(appointment.id, reason);
                                      }
                                    }}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medicines" className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-medical">
              <CardHeader>
                <CardTitle className="text-medical-dark">Medicine Reminders</CardTitle>
                <p className="text-sm text-muted-foreground">View your prescribed medicines and schedules</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="current" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="current">Current ({currentMedicines.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({pastMedicines.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="current">
                    <div className="space-y-4">
                      {currentMedicines.map((medicine) => (
                        <Card key={medicine.id} className="p-4 bg-white/50 border-l-4 border-l-primary">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant={medicine.priority === 'high' ? 'destructive' : 'default'}>
                                  {medicine.priority} priority
                                </Badge>
                                <span className="font-semibold text-medical-dark">{medicine.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {medicine.dosage} • {medicine.frequency}
                              </p>
                              <p className="text-sm mt-1 text-primary">
                                {medicine.remainingDays} days remaining
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteMedicineReminder(medicine.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {currentMedicines.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Pill className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>No current medicine reminders</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="past">
                    <div className="space-y-4">
                      {pastMedicines.map((medicine) => (
                        <Card key={medicine.id} className="p-4 bg-white/30 border-l-4 border-l-muted opacity-75">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="font-semibold text-medical-dark">{medicine.name}</span>
                              <p className="text-sm text-muted-foreground mt-1">
                                {medicine.dosage} • {medicine.frequency}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Completed on {medicine.endDate}
                              </p>
                            </div>
                            <Badge variant="outline">Completed</Badge>
                          </div>
                        </Card>
                      ))}
                      {pastMedicines.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>No past medicines</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="camps" className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-medical">
              <CardHeader>
                <CardTitle className="text-medical-dark">Health Camps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {camps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No health camps scheduled</p>
                      <p className="text-sm">You'll be notified when Dr. Himanshu Sonagara organizes new camps</p>
                    </div>
                  ) : (
                    camps.map((camp) => (
                      <Card key={camp.id} className="p-4 bg-white/50 hover:bg-white/70 transition-all">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-medical-dark">{camp.title}</h3>
                             <Badge variant={
                              camp.status === 'planned' ? 'secondary' :
                              camp.status === 'ongoing' ? 'default' : 'outline'
                             }>
                              {camp.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{camp.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span>{camp.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-primary" />
                              <span>{camp.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <span>TBA</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-primary" />
                              <span>Dr. Himanshu Sonagara</span>
                            </div>
                          </div>
                          {camp.contactInfo && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Contact:</span>
                              <span>{camp.contactInfo}</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-medical">
              <CardHeader>
                <CardTitle className="text-medical-dark">Medical Reports & History</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportsSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Calendar Dialog */}
        <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-medical-dark">Book Appointment</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const now = new Date();
                      const tomorrow = new Date(now);
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      tomorrow.setHours(0, 0, 0, 0);
                      return date < tomorrow;
                    }}
                    className="rounded-md border bg-white"
                  />
                  {!isValidBookingTime(selectedDate) && (
                    <div className="mt-2">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Appointments must be booked at least 24 hours in advance.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Appointment Type</Label>
                  <Select value={newAppointment.type} onValueChange={(value) => 
                    setNewAppointment(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">General Consultation</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="skin">Skin Treatment</SelectItem>
                      <SelectItem value="child">Child Care</SelectItem>
                      <SelectItem value="homeo">Homeopathy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Time Slot</Label>
                  <Select 
                    value={newAppointment.timeSlot} 
                    onValueChange={(value) => setNewAppointment(prev => ({ ...prev, timeSlot: value }))}
                    disabled={!isValidBookingTime(selectedDate)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => {
                        const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
                        const key = `${formattedDate}_${slot}`;
                        const availableSlots = slotAvailability[key] || 0;
                        const isAvailable = availableSlots > 0;
                        
                        return (
                          <SelectItem 
                            key={slot} 
                            value={slot}
                            disabled={!isAvailable}
                            className={!isAvailable ? "text-muted-foreground line-through" : ""}
                          >
                            <span className="flex justify-between w-full">
                              <span>{slot}</span>
                              <span className={`text-xs ${isAvailable ? "text-green-500" : "text-red-500"}`}>
                                {isAvailable ? `${availableSlots} slots available` : 'Fully booked'}
                              </span>
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Reason for Visit</Label>
                  <Textarea 
                    placeholder="Describe your symptoms or reason for visit..."
                    value={newAppointment.reason}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
                
                <Button 
                  onClick={bookAppointment} 
                  className="w-full" 
                  variant="medical"
                  disabled={
                    !selectedDate || 
                    !newAppointment.type || 
                    !newAppointment.reason || 
                    !newAppointment.timeSlot || 
                    !isValidBookingTime(selectedDate) ||
                    (selectedDate && newAppointment.timeSlot && slotAvailability[`${format(selectedDate, 'yyyy-MM-dd')}_${newAppointment.timeSlot}`] <= 0)
                  }
                >
                  Book Appointment
                </Button>
                
                {selectedDate && newAppointment.timeSlot && (
                  <div className="text-center mt-2 text-sm">
                    <p className={slotAvailability[`${format(selectedDate, 'yyyy-MM-dd')}_${newAppointment.timeSlot}`] > 0 ? "text-green-600" : "text-red-600"}>
                      {slotAvailability[`${format(selectedDate, 'yyyy-MM-dd')}_${newAppointment.timeSlot}`] > 0 
                        ? `${slotAvailability[`${format(selectedDate, 'yyyy-MM-dd')}_${newAppointment.timeSlot}`]} slots available for this time period`
                        : 'No slots available for this time period'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alerts Dialog */}
        <Dialog open={showAlerts} onOpenChange={setShowAlerts}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-medical-dark">Notifications & Alerts</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No alerts or notifications</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <Card 
                    key={alert.id} 
                    className={cn(
                      "p-4 cursor-pointer transition-all",
                      alert.read ? "bg-white/30" : "bg-white/80 border-l-4 border-l-primary"
                    )}
                    onClick={() => markAlertAsRead(alert.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {alert.type === 'medicine' && <Pill className="w-4 h-4 text-primary" />}
                          {alert.type === 'appointment' && <CalendarIcon className="w-4 h-4 text-primary" />}
                          {alert.type === 'camp' && <MapPin className="w-4 h-4 text-primary" />}
                          {alert.type === 'general' && <Bell className="w-4 h-4 text-primary" />}
                          <span className="font-semibold text-medical-dark">{alert.title}</span>
                          <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                      {!alert.read && (
                        <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}