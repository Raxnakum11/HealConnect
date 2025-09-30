import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

interface BookAppointmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  newAppointment: {
    type: string;
    reason: string;
    timeSlot: string;
  };
  setNewAppointment: (appointment: any) => void;
  slotAvailability: { [key: string]: number };
  timeSlots: string[];
  bookAppointment: () => void;
  doctorSpecialization: string;
}

export default function BookAppointmentDialog({
  isOpen,
  onOpenChange,
  selectedDate,
  setSelectedDate,
  newAppointment,
  setNewAppointment,
  slotAvailability,
  timeSlots,
  bookAppointment,
  doctorSpecialization
}: BookAppointmentDialogProps) {
  const getSlotAvailability = (date: Date | undefined, slot: string) => {
    if (!date) return 0;
    const formattedDate = format(date, 'yyyy-MM-dd');
    const key = `${formattedDate}_${slot}`;
    return slotAvailability[key] || 5; // Default 5 slots available
  };

  const getSlotColor = (available: number) => {
    if (available === 0) return 'bg-red-100 text-red-800 cursor-not-allowed';
    if (available <= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Schedule an appointment with our doctors. Select a date, time, and provide any additional information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Calendar */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Select Date</Label>
              <div className="mt-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                  className="rounded-md border"
                />
              </div>
            </div>
            
            {selectedDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Appointment Guidelines</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Please arrive 15 minutes before your scheduled time</li>
                  <li>• Bring all relevant medical documents and previous reports</li>
                  <li>• Appointments can be cancelled up to 2 hours before the scheduled time</li>
                  <li>• Emergency appointments are available for urgent cases</li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type</Label>
              <Select 
                value={newAppointment.type} 
                onValueChange={(value) => setNewAppointment({...newAppointment, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">General Consultation</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="checkup">Health Checkup</SelectItem>
                  {doctorSpecialization === 'homeopathy' && (
                    <>
                      <SelectItem value="homeopathy_consultation">Homeopathy Consultation</SelectItem>
                      <SelectItem value="constitutional_treatment">Constitutional Treatment</SelectItem>
                    </>
                  )}
                  {doctorSpecialization === 'allopathy' && (
                    <>
                      <SelectItem value="specialist_consultation">Specialist Consultation</SelectItem>
                      <SelectItem value="diagnostic_review">Diagnostic Review</SelectItem>
                    </>
                  )}
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedDate && (
              <div className="space-y-2">
                <Label>Time Slot</Label>
                <Select 
                  value={newAppointment.timeSlot} 
                  onValueChange={(value) => setNewAppointment({...newAppointment, timeSlot: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => {
                      const available = getSlotAvailability(selectedDate, slot);
                      const isDisabled = available === 0;
                      
                      return (
                        <SelectItem 
                          key={slot} 
                          value={slot} 
                          disabled={isDisabled}
                          className={isDisabled ? 'opacity-50' : ''}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{slot}</span>
                            <Badge 
                              variant={available === 0 ? 'destructive' : available <= 2 ? 'secondary' : 'default'}
                              className="ml-2 text-xs"
                            >
                              {available === 0 ? 'Full' : `${available} left`}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason for Visit</Label>
              <Textarea
                placeholder="Describe your symptoms or reason for the appointment..."
                value={newAppointment.reason}
                onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
                rows={4}
                className="resize-none"
              />
            </div>

            {!selectedDate && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please select a date to view available time slots
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">
                � You can book appointments for today or any future date.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={bookAppointment}
            disabled={!selectedDate || !newAppointment.type || !newAppointment.reason || !newAppointment.timeSlot}
            className="min-w-[140px]"
          >
            Book Appointment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
