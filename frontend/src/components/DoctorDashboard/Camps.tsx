import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Trash2, CalendarIcon, MapPin } from 'lucide-react';

interface Camp {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  contactInfo: string;
  status: 'planned' | 'ongoing' | 'completed';
  patients?: string[];
}

interface CampsProps {
  camps: Camp[];
  setShowCampDialog: (show: boolean) => void;
  removeCamp: (id: string) => void;
  setSelectedCamp: (camp: Camp) => void;
}

const Camps: React.FC<CampsProps> = ({
  camps,
  setShowCampDialog,
  removeCamp,
  setSelectedCamp
}) => {
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
        {camps.map((camp) => (
          <Card key={camp.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{camp.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{camp.location}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setSelectedCamp(camp)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeCamp(camp.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{camp.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{camp.contactInfo}</span>
                </div>
                <p className="text-sm text-muted-foreground">{camp.description}</p>
                <div className="flex justify-between items-center">
                  <Badge variant={
                    camp.status === 'completed' ? 'default' :
                    camp.status === 'ongoing' ? 'destructive' : 'secondary'
                  }>
                    {camp.status}
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
