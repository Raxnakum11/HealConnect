import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Trash2, CalendarIcon, MapPin, Phone } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Camp {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  contactInfo: string;
  status: 'planned' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  patients?: string[];
}

interface CampsProps {
  camps: Camp[];
  setShowCampDialog: (show: boolean) => void;
  removeCamp: (id: string) => Promise<void>;
  viewCampPatients: (camp: Camp) => void;
}

const Camps: React.FC<CampsProps> = ({
  camps,
  setShowCampDialog,
  removeCamp,
  viewCampPatients
}) => {
  // Safely process camps
  const safeCamps = Array.isArray(camps) ? camps.filter(camp => camp && (camp.id || (camp as any)._id)) : [];
  
  const handleDeleteCamp = async (camp: Camp) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${camp.title || 'this camp'}"?\n\nThis action cannot be undone and will permanently remove the camp from the database.`
    );

    if (isConfirmed) {
      await removeCamp(camp.id || (camp as any)._id);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Camp Management</h2>
        <Button onClick={() => setShowCampDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Organize Camp
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeCamps.map((camp) => (
          <Card key={camp.id || (camp as any)._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-foreground mb-1 truncate">
                    {camp.title || 'Untitled Camp'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground truncate">{camp.location || 'Unknown location'}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => viewCampPatients(camp)} className="h-8 w-8 p-0" title="View Registered Patients">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteCamp(camp)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    title="Delete Camp"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(camp.date || '')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{camp.contactInfo || 'No contact'}</span>
                </div>
                <p className="text-sm text-muted-foreground">{camp.description || 'No description'}</p>
                <div className="flex justify-between items-center">
                  <Badge variant={
                    camp.status === 'completed' ? 'default' :
                      camp.status === 'ongoing' ? 'destructive' : 'secondary'
                  }>
                    {camp.status || 'scheduled'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {camp.patients?.length || 0} patients
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default Camps;
