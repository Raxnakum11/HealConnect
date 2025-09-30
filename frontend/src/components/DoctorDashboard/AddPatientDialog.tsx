import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

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

interface Patient {
  id: string;
  name: string;
  mobile: string;
  age: number;
  gender: string;
  address: string;
  medicalHistory: string;
  lastVisit: string;
  nextAppointment?: string;
  type: "clinic" | "camp";
  campId?: string;
}

interface AddPatientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newPatient: {
    name: string;
    mobile: string;
    email: string;
    age: string;
    gender: string;
    address: string;
    medicalHistory: string;
    type: 'clinic' | 'camp';
    campId: string;
  };
  setNewPatient: React.Dispatch<React.SetStateAction<{
    name: string;
    mobile: string;
    email: string;
    age: string;
    gender: string;
    address: string;
    medicalHistory: string;
    type: 'clinic' | 'camp';
    campId: string;
  }>>;
  onAddPatient: () => void;
  camps: Camp[];
}

export default function AddPatientDialog({
  isOpen,
  onOpenChange,
  newPatient,
  setNewPatient,
  onAddPatient,
  camps
}: AddPatientDialogProps) {
  const availableCamps = camps || [];
  const activeCamps = availableCamps.filter(camp => camp.status === 'planned' || camp.status === 'ongoing');
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Add a new patient to your practice. Fill in the required information and optionally provide an email address for notifications.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Patient Type</Label>
            <Select value={newPatient.type} onValueChange={(value: 'clinic' | 'camp') => {
              setNewPatient(prev => ({ 
                ...prev, 
                type: value,
                campId: value === 'clinic' ? '' : prev.campId
              }));
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinic">Clinic Patient</SelectItem>
                <SelectItem value="camp">Camp Patient</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Full Name</Label>
            <Input 
              value={newPatient.name} 
              onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter patient name"
            />
          </div>
          <div>
            <Label>Mobile Number</Label>
            <Input 
              value={newPatient.mobile} 
              onChange={(e) => {
                // Only allow digits and limit to 12 characters
                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                setNewPatient(prev => ({ ...prev, mobile: value }))
              }}
              placeholder="Enter mobile number (10-12 digits)"
              maxLength={12}
            />
            {newPatient.mobile && !/^\d{10,12}$/.test(newPatient.mobile) && (
              <p className="text-xs text-red-500 mt-1">
                Mobile number must be 10-12 digits only
              </p>
            )}
          </div>
          <div>
            <Label>Email Address (Optional)</Label>
            <Input 
              type="email"
              value={newPatient.email} 
              onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address for notifications"
            />
            {newPatient.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(newPatient.email) && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a valid email address
              </p>
            )}
          </div>
          <div>
            <Label>Age</Label>
            <Input 
              type="number"
              value={newPatient.age} 
              onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
              placeholder="Enter age"
            />
          </div>
          <div>
            <Label>Gender</Label>
            <Select value={newPatient.gender} onValueChange={(value) => setNewPatient(prev => ({ ...prev, gender: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {newPatient.type === 'camp' && (
            <div>
              <Label>Select Camp</Label>
              <Select 
                value={newPatient.campId} 
                onValueChange={(value) => setNewPatient(prev => ({ ...prev, campId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a camp" />
                </SelectTrigger>
                <SelectContent>
                  {activeCamps.length === 0 ? (
                    <SelectItem value="no-camps" disabled>No camps available</SelectItem>
                  ) : (
                    activeCamps.map(camp => (
                      <SelectItem key={camp.id} value={camp.id}>
                        {camp.title} - {camp.location} ({formatDate(camp.date)})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {activeCamps.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  No camps available. Please create a camp first to add camp patients.
                </p>
              )}
            </div>
          )}
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Textarea 
              value={newPatient.address} 
              onChange={(e) => setNewPatient(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter address"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Medical History</Label>
            <Textarea 
              value={newPatient.medicalHistory} 
              onChange={(e) => setNewPatient(prev => ({ ...prev, medicalHistory: e.target.value }))}
              placeholder="Enter medical history"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={onAddPatient}
            disabled={!newPatient.name || !newPatient.mobile || !/^\d{10,12}$/.test(newPatient.mobile) || !newPatient.age || !newPatient.gender || !newPatient.address}
          >
            Add Patient
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
