import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn, formatDate, formatTime } from '@/lib/utils';
import { Calendar, CheckCircle, X, Trash2, RotateCcw } from 'lucide-react';

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
  handleBookingAction: (bookingId: string, action: 'approve' | 'reject' | 'delete') => void;
}

const Booking: React.FC<BookingProps> = ({ bookings, handleBookingAction }) => {
  const [approveDialogs, setApproveDialogs] = useState<{[key: string]: boolean}>({});
  const [rejectDialogs, setRejectDialogs] = useState<{[key: string]: boolean}>({});
  const [deleteDialogs, setDeleteDialogs] = useState<{[key: string]: boolean}>({});

  const handleApprove = (bookingId: string) => {
    handleBookingAction(bookingId, 'approve');
    setApproveDialogs(prev => ({ ...prev, [bookingId]: false }));
  };

  const handleReject = (bookingId: string) => {
    handleBookingAction(bookingId, 'reject');
    setRejectDialogs(prev => ({ ...prev, [bookingId]: false }));
  };

  const handleDelete = (bookingId: string) => {
    handleBookingAction(bookingId, 'delete');
    setDeleteDialogs(prev => ({ ...prev, [bookingId]: false }));
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Patient Bookings</h2>
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-full w-fit">
          {bookings.filter(b => b.status === 'pending').length} Pending
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className={cn(
            'bg-gradient-to-br from-white to-blue-50/30 border border-blue-200/60 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300',
            'relative mb-3 hover:scale-[1.01]'
          )}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h2 className="font-bold text-lg text-slate-800 mb-0.5">{booking.patientName}</h2>
                <p className="text-xs text-slate-500 font-medium">ID: {booking.patientId}</p>
              </div>
              <Badge variant={
                booking.status === 'pending' ? 'secondary' :
                booking.status === 'approved' ? 'default' :
                booking.status === 'rejected' ? 'destructive' :
                booking.status === 'cancelled' ? 'outline' : 'default'
              } className={cn(
                "text-xs font-semibold px-3 py-1 rounded-full",
                booking.status === 'pending' && 'bg-amber-100 text-amber-700 border-amber-200',
                booking.status === 'approved' && 'bg-emerald-100 text-emerald-700 border-emerald-200',
                booking.status === 'rejected' && 'bg-red-100 text-red-700 border-red-200',
                booking.status === 'cancelled' && 'bg-gray-100 text-gray-700 border-gray-200'
              )}>{booking.status}</Badge>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Type:</span>
                <span className="text-xs font-semibold text-slate-800 bg-blue-50 px-2 py-0.5 rounded">{booking.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Date:</span>
                <span className="text-xs font-semibold text-slate-800">{formatDate(booking.date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Time:</span>
                <span className="text-xs font-semibold text-blue-600">{formatTime(booking.time)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-600">Reason:</span>
                <span className="text-xs text-slate-700 bg-slate-50 p-1.5 rounded italic truncate">{booking.reason}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {booking.status === 'pending' && (
                <>
                  <Dialog open={approveDialogs[booking.id]} onOpenChange={(open) => setApproveDialogs(prev => ({ ...prev, [booking.id]: open }))}>
                    <DialogTrigger asChild>
                      <Button variant="default" className="flex-1 flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-1.5 text-xs rounded transition-colors">
                        <CheckCircle className="w-3 h-3" /> Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Appointment</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p>Are you sure you want to approve this appointment for <strong>{booking.patientName}</strong>?</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Date: {formatDate(booking.date)}</p>
                          <p>Time: {formatTime(booking.time)}</p>
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
                      <Button variant="destructive" className="flex-1 flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 text-xs rounded transition-colors">
                        <X className="w-3 h-3" /> Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Appointment</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p>Are you sure you want to reject this appointment for <strong>{booking.patientName}</strong>?</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Date: {formatDate(booking.date)}</p>
                          <p>Time: {formatTime(booking.time)}</p>
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
                  {/* Delete Button for Pending */}
                  <Dialog open={deleteDialogs[booking.id]} onOpenChange={(open) => setDeleteDialogs(prev => ({ ...prev, [booking.id]: open }))}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="px-2 py-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Appointment</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p>Are you sure you want to delete this appointment for <strong>{booking.patientName}</strong>?</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Date: {formatDate(booking.date)}</p>
                          <p>Time: {formatTime(booking.time)}</p>
                          <p>This action cannot be undone.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4 justify-end">
                        <Button variant="outline" onClick={() => setDeleteDialogs(prev => ({ ...prev, [booking.id]: false }))}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(booking.id)}>
                          Yes, Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              {booking.status === 'approved' && (
                <>
                  {/* Change to Reject Button for Approved */}
                  <Dialog open={rejectDialogs[booking.id]} onOpenChange={(open) => setRejectDialogs(prev => ({ ...prev, [booking.id]: open }))}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1 flex items-center gap-1 border-orange-200 text-orange-600 hover:bg-orange-50 font-medium py-1.5 text-xs rounded transition-colors">
                        <RotateCcw className="w-3 h-3" /> Change to Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Status to Rejected</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p>Are you sure you want to change this approved appointment to rejected for <strong>{booking.patientName}</strong>?</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Date: {formatDate(booking.date)}</p>
                          <p>Time: {formatTime(booking.time)}</p>
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
                  {/* Delete Button for Approved */}
                  <Dialog open={deleteDialogs[booking.id]} onOpenChange={(open) => setDeleteDialogs(prev => ({ ...prev, [booking.id]: open }))}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="px-2 py-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Appointment</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p>Are you sure you want to delete this approved appointment for <strong>{booking.patientName}</strong>?</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Date: {formatDate(booking.date)}</p>
                          <p>Time: {formatTime(booking.time)}</p>
                          <p>This action cannot be undone.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4 justify-end">
                        <Button variant="outline" onClick={() => setDeleteDialogs(prev => ({ ...prev, [booking.id]: false }))}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(booking.id)}>
                          Yes, Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              {booking.status === 'rejected' && (
                <>
                  {/* Change to Approve Button for Rejected */}
                  <Dialog open={approveDialogs[booking.id]} onOpenChange={(open) => setApproveDialogs(prev => ({ ...prev, [booking.id]: open }))}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1 flex items-center gap-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-medium py-1.5 text-xs rounded transition-colors">
                        <RotateCcw className="w-3 h-3" /> Change to Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Status to Approved</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p>Are you sure you want to change this rejected appointment to approved for <strong>{booking.patientName}</strong>?</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Date: {formatDate(booking.date)}</p>
                          <p>Time: {formatTime(booking.time)}</p>
                          <p>Type: {booking.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4 justify-end">
                        <Button variant="outline" onClick={() => setApproveDialogs(prev => ({ ...prev, [booking.id]: false }))}>
                          Cancel
                        </Button>
                        <Button variant="default" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => handleApprove(booking.id)}>
                          Yes, Approve
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {/* Delete Button for Rejected */}
                  <Dialog open={deleteDialogs[booking.id]} onOpenChange={(open) => setDeleteDialogs(prev => ({ ...prev, [booking.id]: open }))}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="px-2 py-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Appointment</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p>Are you sure you want to delete this rejected appointment for <strong>{booking.patientName}</strong>?</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Date: {formatDate(booking.date)}</p>
                          <p>Time: {formatTime(booking.time)}</p>
                          <p>This action cannot be undone.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4 justify-end">
                        <Button variant="outline" onClick={() => setDeleteDialogs(prev => ({ ...prev, [booking.id]: false }))}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(booking.id)}>
                          Yes, Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              {(booking.status === 'completed' || booking.status === 'cancelled') && (
                <>
                  <div className="flex-1 text-center py-2">
                    <Badge className={cn(
                      "px-4 py-1 text-xs font-semibold rounded",
                      booking.status === 'completed' && 'bg-blue-100 text-blue-700 border-blue-200',
                      booking.status === 'cancelled' && 'bg-gray-100 text-gray-700 border-gray-200'
                    )}>
                      {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                    </Badge>
                  </div>
                  {/* Delete Button for Other Statuses */}
                  <Dialog open={deleteDialogs[booking.id]} onOpenChange={(open) => setDeleteDialogs(prev => ({ ...prev, [booking.id]: open }))}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="px-2 py-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Appointment</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p>Are you sure you want to delete this appointment for <strong>{booking.patientName}</strong>?</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Date: {formatDate(booking.date)}</p>
                          <p>Time: {formatTime(booking.time)}</p>
                          <p>Status: {booking.status}</p>
                          <p>This action cannot be undone.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4 justify-end">
                        <Button variant="outline" onClick={() => setDeleteDialogs(prev => ({ ...prev, [booking.id]: false }))}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(booking.id)}>
                          Yes, Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
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
