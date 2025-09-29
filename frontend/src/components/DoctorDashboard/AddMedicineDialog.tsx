import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Medicine {
  id: string;
  name: string;
  batch: string;
  quantity: number;
  size: string;
  unit: 'mg' | 'g' | 'ml' | 'tablets' | 'capsules' | 'drops' | 'syrup';
  expiryDate: string;
  priority: 'high' | 'medium' | 'low';
  type: 'clinic' | 'camp' | 'others';
}

interface AddMedicineDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newMedicine: {
    name: string;
    batch: string;
    quantity: string;
    size: string;
    unit: 'mg' | 'g' | 'ml' | 'tablets' | 'capsules' | 'drops' | 'syrup';
    expiryDate: string;
    priority: 'high' | 'medium' | 'low';
    type: 'clinic' | 'camp' | 'others';
  };
  setNewMedicine: React.Dispatch<React.SetStateAction<{
    name: string;
    batch: string;
    quantity: string;
    size: string;
    unit: 'mg' | 'g' | 'ml' | 'tablets' | 'capsules' | 'drops' | 'syrup';
    expiryDate: string;
    priority: 'high' | 'medium' | 'low';
    type: 'clinic' | 'camp' | 'others';
  }>>;
  onAddMedicine: () => void;
}

export default function AddMedicineDialog({
  isOpen,
  onOpenChange,
  newMedicine,
  setNewMedicine,
  onAddMedicine
}: AddMedicineDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Medicine</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Medicine Type</Label>
            <Select value={newMedicine.type} onValueChange={(value: 'clinic' | 'camp' | 'others') => setNewMedicine(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinic">Clinic Inventory</SelectItem>
                <SelectItem value="camp">Camp Inventory</SelectItem>
                <SelectItem value="others">Others Inventory</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Medicine Name</Label>
            <Input 
              value={newMedicine.name} 
              onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter medicine name"
            />
          </div>
          <div>
            <Label>Medicine Size</Label>
            <Input 
              value={newMedicine.size} 
              onChange={(e) => setNewMedicine(prev => ({ ...prev, size: e.target.value }))}
              placeholder="Enter size (e.g., 500, 250)"
            />
          </div>
          <div>
            <Label>Unit</Label>
            <Select value={newMedicine.unit} onValueChange={(value: 'mg' | 'g' | 'ml' | 'tablets' | 'capsules' | 'drops' | 'syrup') => setNewMedicine(prev => ({ ...prev, unit: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mg">mg (milligrams)</SelectItem>
                <SelectItem value="g">g (grams)</SelectItem>
                <SelectItem value="ml">ml (milliliters)</SelectItem>
                <SelectItem value="tablets">Tablets</SelectItem>
                <SelectItem value="capsules">Capsules</SelectItem>
                <SelectItem value="drops">Drops</SelectItem>
                <SelectItem value="syrup">Syrup</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Batch Number</Label>
            <Input 
              value={newMedicine.batch} 
              onChange={(e) => setNewMedicine(prev => ({ ...prev, batch: e.target.value }))}
              placeholder="Enter batch number"
            />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input 
              type="number"
              value={newMedicine.quantity} 
              onChange={(e) => setNewMedicine(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="Enter quantity"
            />
          </div>
          <div>
            <Label>Expiry Date</Label>
            <Input 
              type="date"
              value={newMedicine.expiryDate} 
              onChange={(e) => setNewMedicine(prev => ({ ...prev, expiryDate: e.target.value }))}
            />
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={newMedicine.priority} onValueChange={(value: 'high' | 'medium' | 'low') => setNewMedicine(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onAddMedicine}>Add Medicine</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
