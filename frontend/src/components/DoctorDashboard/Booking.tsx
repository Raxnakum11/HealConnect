import React from 'react';
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
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patient Bookings</h2>
        <Badge variant="secondary">{bookings.filter(b => b.status === 'pending').length} Pending</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className={cn(
            'bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-medical',
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" className="flex-1 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Approve
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to approve?</DialogTitle>
                  </DialogHeader>
                  <div className="flex gap-4 mt-4 justify-end">
                    <Button variant="outline">Cancel</Button>
                    <Button variant="default" onClick={() => handleBookingAction(booking.id, 'approve')}>Yes, Approve</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="flex-1 flex items-center gap-2">
                    <X className="w-5 h-5" /> Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to reject?</DialogTitle>
                  </DialogHeader>
                  <div className="flex gap-4 mt-4 justify-end">
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive" onClick={() => handleBookingAction(booking.id, 'reject')}>Yes, Reject</Button>
                  </div>
                </DialogContent>
              </Dialog>
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
