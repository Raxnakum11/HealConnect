import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, CheckCircle, X } from 'lucide-react';

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

interface AppointmentsProps {
  appointments: Appointment[];
  setShowBookDialog: (show: boolean) => void;
  cancelAppointment: (id: string) => void;
}

export default function Appointments({ 
  appointments, 
  setShowBookDialog, 
  cancelAppointment 
}: AppointmentsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Appointments</h2>
        <Button onClick={() => setShowBookDialog(true)} size="sm" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">No appointments scheduled</p>
              <Button 
                onClick={() => setShowBookDialog(true)} 
                className="mt-4"
                variant="outline"
              >
                Book Your First Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg">{appointment.type}</CardTitle>
                  <Badge className={getStatusColor(appointment.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(appointment.status)}
                      <span className="text-xs">{appointment.status}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm">{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm">{appointment.time}</span>
                      {appointment.slotNumber && (
                        <Badge variant="outline" className="text-xs">Slot {appointment.slotNumber}</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{appointment.reason}</p>
                  {appointment.cancelReason && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                      <p className="text-sm text-red-600">
                        <strong>Cancelled:</strong> {appointment.cancelReason}
                      </p>
                    </div>
                  )}
                </div>
                {appointment.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Appointment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>Are you sure you want to cancel this appointment?</p>
                          <div className="flex gap-2">
                            <Button 
                              variant="destructive" 
                              onClick={() => cancelAppointment(appointment.id)}
                            >
                              Yes, Cancel
                            </Button>
                            <Button variant="outline">
                              No, Keep Appointment
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
