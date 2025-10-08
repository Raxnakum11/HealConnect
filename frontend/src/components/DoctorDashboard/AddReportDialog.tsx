import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  type: "clinic" | "camp";
  campId?: string;
  visitHistory?: any[];
  prescriptions?: any[];
}

interface AddReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPatient: Patient | null;
  newReport: {
    type: string;
    title: string;
    description: string;
    file: File | null;
  };
  setNewReport: React.Dispatch<React.SetStateAction<{
    type: string;
    title: string;
    description: string;
    file: File | null;
  }>>;
  onAddPatientReport: () => void;
}

export default function AddReportDialog({
  isOpen,
  onOpenChange,
  selectedPatient,
  newReport,
  setNewReport,
  onAddPatientReport
}: AddReportDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Medical Report for {selectedPatient?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Report Type</Label>
            <Select value={newReport.type} onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lab Test">Lab Test</SelectItem>
                <SelectItem value="X-Ray">X-Ray</SelectItem>
                <SelectItem value="Blood Test">Blood Test</SelectItem>
                <SelectItem value="Consultation">Consultation</SelectItem>
                <SelectItem value="Prescription">Prescription</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Report Title</Label>
            <Input
              value={newReport.title}
              onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter report title"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={newReport.description}
              onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter report description..."
            />
          </div>

          <div>
            <Label>Upload File (Optional)</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setNewReport(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onAddPatientReport}>
              Add Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
