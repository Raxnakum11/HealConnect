import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Download, Upload, Plus, Building2, Tent, Package, Trash2 } from 'lucide-react';

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

interface InventoryProps {
  medicines: Medicine[];
  expiringMedicines: Medicine[];
  filteredMedicines: Medicine[];
  medicineFilter: "all" | "clinic" | "camp" | "others";
  setMedicineFilter: (filter: "all" | "clinic" | "camp" | "others") => void;
  expiryFilter: "all" | "expiring";
  setExpiryFilter: (filter: "all" | "expiring") => void;
  exportExpiringMedicines: () => void;
  importMedicines: () => void;
  setShowMedicineDialog: (show: boolean) => void;
  removeMedicine: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({
  medicines,
  expiringMedicines,
  filteredMedicines,
  medicineFilter,
  setMedicineFilter,
  expiryFilter,
  setExpiryFilter,
  exportExpiringMedicines,
  importMedicines,
  setShowMedicineDialog,
  removeMedicine
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Medicine Inventory</h2>
        <div className="flex gap-2">
          <Button onClick={exportExpiringMedicines} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Expiring
          </Button>
          <Button onClick={importMedicines} variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => setShowMedicineDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Medicine
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={medicineFilter} onValueChange={(value: "all" | "clinic" | "camp" | "others") => setMedicineFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Inventory</SelectItem>
            <SelectItem value="clinic">Clinic Inventory</SelectItem>
            <SelectItem value="camp">Camp Inventory</SelectItem>
            <SelectItem value="others">Others Inventory</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={expiryFilter} onValueChange={(value: "all" | "expiring") => setExpiryFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Medicines</SelectItem>
            <SelectItem value="expiring">Expiring Soon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={medicineFilter === "all" ? "all" : medicineFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" onClick={() => setMedicineFilter("all")}>
            All ({medicines.length})
          </TabsTrigger>
          <TabsTrigger value="clinic" onClick={() => setMedicineFilter("clinic")}>
            <Building2 className="w-4 h-4 mr-1" />
            Clinic ({medicines.filter(m => m.type === 'clinic').length})
          </TabsTrigger>
          <TabsTrigger value="camp" onClick={() => setMedicineFilter("camp")}>
            <Tent className="w-4 h-4 mr-1" />
            Camp ({medicines.filter(m => m.type === 'camp').length})
          </TabsTrigger>
          <TabsTrigger value="others" onClick={() => setMedicineFilter("others")}>
            <Package className="w-4 h-4 mr-1" />
            Others ({medicines.filter(m => m.type === 'others').length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={medicineFilter === "all" ? "all" : medicineFilter}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {filteredMedicines.map((medicine) => {
              const isExpiring = expiringMedicines.includes(medicine);
              return (
                <Card key={medicine.id} className={cn(
                  "hover:shadow-lg transition-all",
                  isExpiring && "border-red-200 bg-red-50",
                  medicine.priority === 'high' && "border-l-4 border-l-red-500",
                  medicine.priority === 'medium' && "border-l-4 border-l-yellow-500",
                  medicine.priority === 'low' && "border-l-4 border-l-green-500"
                )}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-sm">{medicine.name}</h3>
                        {medicine.size && medicine.unit && (
                          <p className="text-xs text-primary font-medium">{medicine.size} {medicine.unit}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Batch: {medicine.batch}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => removeMedicine(medicine.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Badge variant={
                          medicine.priority === 'high' ? 'destructive' : 
                          medicine.priority === 'medium' ? 'default' : 'secondary'
                        } className="text-xs">
                          {medicine.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {medicine.type}
                        </Badge>
                      </div>
                      <p className="text-xs"><strong>Quantity:</strong> {medicine.quantity}</p>
                      <p className="text-xs"><strong>Expiry:</strong> {medicine.expiryDate}</p>
                      {isExpiring && (
                        <Badge variant="destructive" className="text-xs w-full justify-center">
                          Expiring Soon!
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Inventory;
