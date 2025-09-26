import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

interface Prescription {
  id: string;
  prescribedDate: string;
  doctorName: string;
  instructions: string;
  nextVisitDate?: string;
  priority: 'high' | 'medium' | 'low';
  type: 'current' | 'past';
  status: 'active' | 'completed';
}

interface MedicinesProps {
  prescriptions: Prescription[];
}

export default function Medicines({ prescriptions }: MedicinesProps) {
  const currentPrescriptions = prescriptions.filter(prescription => prescription.type === 'current');
  const pastPrescriptions = prescriptions.filter(prescription => prescription.type === 'past');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <FileText className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const PrescriptionCard = ({ prescription, showStatus = false }: { prescription: Prescription; showStatus?: boolean }) => (
    <Card key={prescription.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Doctor's Prescription
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={getPriorityColor(prescription.priority)}>
              <div className="flex items-center gap-1">
                {getPriorityIcon(prescription.priority)}
                {prescription.priority}
              </div>
            </Badge>
            {showStatus && (
              <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                {prescription.status === 'active' ? 'Active' : 'Completed'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Prescribed by</p>
              <p className="text-sm font-medium">{prescription.doctorName}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Prescribed Date</p>
              <p className="text-sm">{prescription.prescribedDate}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">Doctor's Instructions</p>
            <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
              {prescription.instructions || 'No specific instructions provided.'}
            </p>
          </div>

          {prescription.nextVisitDate && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs font-medium text-green-700">Next Visit</p>
                <p className="text-sm text-green-800">{prescription.nextVisitDate}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Doctor's Prescriptions</h2>
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current ({currentPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastPrescriptions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <div className="grid gap-4">
            {currentPrescriptions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">No current prescriptions</p>
                  <p className="text-sm text-gray-400 text-center mt-2">
                    Your active prescriptions will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              currentPrescriptions.map((prescription) => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="past">
          <div className="grid gap-4">
            {pastPrescriptions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">No past prescriptions</p>
                  <p className="text-sm text-gray-400 text-center mt-2">
                    Your completed prescriptions will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastPrescriptions.map((prescription) => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
