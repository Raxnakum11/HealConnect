import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Calendar, CheckCircle, X } from 'lucide-react';

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

interface BookingProps {
  bookings: Booking[];
  handleBookingAction: (bookingId: string, action: 'approve' | 'reject') => void;
}

const Booking: React.FC<BookingProps> = ({ bookings, handleBookingAction }) => {
  const [approveDialogs, setApproveDialogs] = useState<{[key: string]: boolean}>({});
  const [rejectDialogs, setRejectDialogs] = useState<{[key: string]: boolean}>({});

  const handleApprove = (bookingId: string) => {
    handleBookingAction(bookingId, 'approve');
    setApproveDialogs(prev => ({ ...prev, [bookingId]: false }));
  };

  const handleReject = (bookingId: string) => {
    handleBookingAction(bookingId, 'reject');
    setRejectDialogs(prev => ({ ...prev, [bookingId]: false }));
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patient Bookings</h2>
        <Badge variant="secondary">{bookings.filter(b => b.status === 'pending').length} Pending</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className={cn(
            'bg-white-120 border border-blue-200 rounded-xl p-6 shadow-medical',
            'relative mb-4'
          )}>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="font-semibold text-lg text-medical-dark">{booking.patientName}</h2>
                <p className="text-xs text-muted-foreground">ID: {booking.patientId}</p>
              </div>
              <Badge variant={
                booking.status === 'pending' ? 'secondary' :
                booking.status === 'approved' ? 'default' :
                booking.status === 'rejected' ? 'destructive' :
                booking.status === 'cancelled' ? 'outline' : 'default'
              } className="absolute top-4 right-4">{booking.status}</Badge>
            </div>
            <div className="mb-2">
              <p><span className="font-semibold">Type:</span> {booking.type}</p>
              <p><span className="font-semibold">Date:</span> {booking.date}</p>
              <p><span className="font-semibold">Time:</span> {booking.time}</p>
              <p><span className="font-semibold">Reason:</span> {booking.reason}</p>
            </div>
            <div className="flex gap-4 mt-4">
              {booking.status === 'pending' && (
                <>
                  <Dialog open={approveDialogs[booking.id]} onOpenChange={(open) => setApproveDialogs(prev => ({ ...prev, [booking.id]: open }))}>
                    <DialogTrigger asChild>
                      <Button variant="default" className="flex-1 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Appointment</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p>Are you sure you want to approve this appointment for <strong>{booking.patientName}</strong>?</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Date: {booking.date}</p>
                          <p>Time: {booking.time}</p>
                          <p>Type: {booking.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4 justify-end">
                        <Button variant="outline" onClick={() => setApproveDialogs(prev => ({ ...prev, [booking.id]: false }))}>
                          Cancel
                        </Button>
                        <Button variant="default" onClick={() => handleApprove(booking.id)}>
                          Yes, Approve
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={rejectDialogs[booking.id]} onOpenChange={(open) => setRejectDialogs(prev => ({ ...prev, [booking.id]: open }))}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="flex-1 flex items-center gap-2">
                        <X className="w-5 h-5" /> Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Appointment</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p>Are you sure you want to reject this appointment for <strong>{booking.patientName}</strong>?</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Date: {booking.date}</p>
                          <p>Time: {booking.time}</p>
                          <p>Type: {booking.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4 justify-end">
                        <Button variant="outline" onClick={() => setRejectDialogs(prev => ({ ...prev, [booking.id]: false }))}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleReject(booking.id)}>
                          Yes, Reject
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              {booking.status !== 'pending' && (
                <div className="text-center w-full py-2">
                  <Badge variant={booking.status === 'approved' ? 'default' : 'destructive'}>
                    {booking.status === 'approved' ? 'Approved' : 'Rejected'}
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No bookings found</p>
        </div>
      )}
    </>
  );
};

export default Booking;
