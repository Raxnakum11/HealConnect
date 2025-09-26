import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface AddCampDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newCamp: {
    title: string;
    date: string;
    location: string;
    description: string;
    contactInfo: string;
    status: 'planned' | 'ongoing' | 'completed';
  };
  setNewCamp: React.Dispatch<React.SetStateAction<{
    title: string;
    date: string;
    location: string;
    description: string;
    contactInfo: string;
    status: 'planned' | 'ongoing' | 'completed';
  }>>;
  onAddCamp: () => void;
}

export default function AddCampDialog({
  isOpen,
  onOpenChange,
  newCamp,
  setNewCamp,
  onAddCamp
}: AddCampDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Organize Health Camp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Camp Title</Label>
            <Input 
              value={newCamp.title} 
              onChange={(e) => setNewCamp(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter camp title"
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input 
              type="date"
              value={newCamp.date} 
              onChange={(e) => setNewCamp(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input 
              value={newCamp.location} 
              onChange={(e) => setNewCamp(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter location"
            />
          </div>
          <div>
            <Label>Contact Information</Label>
            <Input 
              value={newCamp.contactInfo} 
              onChange={(e) => setNewCamp(prev => ({ ...prev, contactInfo: e.target.value }))}
              placeholder="Enter contact information"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              value={newCamp.description} 
              onChange={(e) => setNewCamp(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter camp description"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={newCamp.status} onValueChange={(value: 'planned' | 'ongoing' | 'completed') => setNewCamp(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onAddCamp}>Organize Camp</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
