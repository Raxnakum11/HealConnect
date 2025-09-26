import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, TestTube, History, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Patient {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

interface EmailNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
}

export default function EmailNotificationDialog({ isOpen, onClose, patients }: EmailNotificationProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('send');
  const [isLoading, setIsLoading] = useState(false);
  
  // Single email notification state
  const [singleEmail, setSingleEmail] = useState({
    patientId: '',
    type: 'general' as 'appointment' | 'prescription' | 'report' | 'camp' | 'general',
    title: '',
    message: '',
    doctorName: 'Dr. User', // This would come from auth context
    date: new Date().toLocaleDateString(),
    time: '',
    location: '',
    // Prescription specific
    prescriptionId: '',
    medicines: '',
    // Report specific
    reportType: '',
    testResults: '',
    summary: '',
    // Camp specific
    campName: '',
    contactInfo: '',
    services: ''
  });

  // Bulk email notification state
  const [bulkEmail, setBulkEmail] = useState({
    selectedPatients: [] as string[],
    type: 'general' as 'appointment' | 'prescription' | 'report' | 'camp' | 'general',
    title: '',
    message: '',
    doctorName: 'Dr. User',
    date: new Date().toLocaleDateString(),
  });

  // Test email state
  const [testEmail, setTestEmail] = useState('');

  // Get patients with email addresses
  const patientsWithEmail = patients.filter(patient => patient.email);

  const handleSendSingleEmail = async () => {
    if (!singleEmail.patientId || !singleEmail.message) {
      toast({
        title: "Error",
        description: "Please select a patient and enter a message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const selectedPatient = patientsWithEmail.find(p => p.id === singleEmail.patientId);
      
      // Prepare data based on notification type
      let emailData;
      switch (singleEmail.type) {
        case 'appointment':
          emailData = {
            patientName: selectedPatient?.name,
            doctorName: singleEmail.doctorName,
            date: singleEmail.date,
            time: singleEmail.time,
            location: singleEmail.location,
            type: 'General Consultation'
          };
          break;
        case 'prescription':
          emailData = {
            patientName: selectedPatient?.name,
            doctorName: singleEmail.doctorName,
            prescriptionId: singleEmail.prescriptionId || 'PRE' + Date.now(),
            date: singleEmail.date,
            medicines: singleEmail.medicines ? singleEmail.medicines.split(',').map(med => ({
              name: med.trim(),
              dosage: '1 tablet',
              frequency: 'Twice daily'
            })) : []
          };
          break;
        case 'report':
          emailData = {
            patientName: selectedPatient?.name,
            doctorName: singleEmail.doctorName,
            reportType: singleEmail.reportType,
            date: singleEmail.date,
            testResults: singleEmail.testResults,
            summary: singleEmail.summary
          };
          break;
        case 'camp':
          emailData = {
            patientName: selectedPatient?.name,
            campName: singleEmail.campName,
            date: singleEmail.date,
            time: singleEmail.time,
            location: singleEmail.location,
            contactInfo: singleEmail.contactInfo,
            services: singleEmail.services
          };
          break;
        default:
          emailData = {
            patientName: selectedPatient?.name,
            title: singleEmail.title,
            message: singleEmail.message,
            doctorName: singleEmail.doctorName
          };
      }

      await api.notifications.sendEmailNotification(singleEmail.patientId, singleEmail.type, emailData);
      
      toast({
        title: "Success",
        description: "Email notification sent successfully!",
      });

      // Reset form
      setSingleEmail({
        ...singleEmail,
        patientId: '',
        title: '',
        message: ''
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send email notification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBulkEmail = async () => {
    if (bulkEmail.selectedPatients.length === 0 || !bulkEmail.message) {
      toast({
        title: "Error",
        description: "Please select patients and enter a message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const emailData = {
        title: bulkEmail.title,
        message: bulkEmail.message,
        doctorName: bulkEmail.doctorName,
        date: bulkEmail.date
      };

      const result = await api.notifications.sendBulkEmailNotifications(
        bulkEmail.selectedPatients, 
        bulkEmail.type, 
        emailData
      );
      
      toast({
        title: "Bulk Email Sent",
        description: `${result.summary.successful} emails sent successfully, ${result.summary.failed} failed.`,
      });

      // Reset form
      setBulkEmail({
        ...bulkEmail,
        selectedPatients: [],
        title: '',
        message: ''
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send bulk email notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.notifications.testEmailConfiguration(testEmail);
      
      toast({
        title: "Test Email Sent",
        description: "Check your inbox to verify email configuration!",
      });

      setTestEmail('');
    } catch (error) {
      toast({
        title: "Test Failed",
        description: error.message || "Email configuration test failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </DialogTitle>
          <DialogDescription>
            Send email notifications to patients about appointments, prescriptions, reports, and medical camps.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Email
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Bulk Email
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Test Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Send Individual Email Notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Select Patient</Label>
                    <Select value={singleEmail.patientId} onValueChange={(value) => setSingleEmail(prev => ({ ...prev, patientId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patientsWithEmail.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} ({patient.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {patientsWithEmail.length === 0 && (
                      <p className="text-xs text-orange-500 mt-1">
                        No patients with email addresses found. Please add email addresses to patient profiles.
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Notification Type</Label>
                    <Select value={singleEmail.type} onValueChange={(value: any) => setSingleEmail(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Notification</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="report">Medical Report</SelectItem>
                        <SelectItem value="camp">Medical Camp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input 
                    value={singleEmail.title} 
                    onChange={(e) => setSingleEmail(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Email subject"
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea 
                    value={singleEmail.message} 
                    onChange={(e) => setSingleEmail(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your message"
                    rows={4}
                  />
                </div>

                {/* Additional fields based on notification type */}
                {singleEmail.type === 'appointment' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date & Time</Label>
                      <Input 
                        value={singleEmail.time} 
                        onChange={(e) => setSingleEmail(prev => ({ ...prev, time: e.target.value }))}
                        placeholder="e.g., 2:00 PM"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input 
                        value={singleEmail.location} 
                        onChange={(e) => setSingleEmail(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Clinic location"
                      />
                    </div>
                  </div>
                )}

                {singleEmail.type === 'prescription' && (
                  <div>
                    <Label>Medicines (comma separated)</Label>
                    <Input 
                      value={singleEmail.medicines} 
                      onChange={(e) => setSingleEmail(prev => ({ ...prev, medicines: e.target.value }))}
                      placeholder="Medicine 1, Medicine 2, Medicine 3"
                    />
                  </div>
                )}

                {singleEmail.type === 'camp' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Camp Name</Label>
                      <Input 
                        value={singleEmail.campName} 
                        onChange={(e) => setSingleEmail(prev => ({ ...prev, campName: e.target.value }))}
                        placeholder="Medical camp name"
                      />
                    </div>
                    <div>
                      <Label>Contact Info</Label>
                      <Input 
                        value={singleEmail.contactInfo} 
                        onChange={(e) => setSingleEmail(prev => ({ ...prev, contactInfo: e.target.value }))}
                        placeholder="Contact number"
                      />
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleSendSingleEmail} 
                  disabled={isLoading || !singleEmail.patientId || !singleEmail.message}
                  className="w-full"
                >
                  {isLoading ? 'Sending...' : 'Send Email'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Send Bulk Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Patients ({bulkEmail.selectedPatients.length} selected)</Label>
                  <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                    {patientsWithEmail.map(patient => (
                      <div key={patient.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={bulkEmail.selectedPatients.includes(patient.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkEmail(prev => ({
                                ...prev,
                                selectedPatients: [...prev.selectedPatients, patient.id]
                              }));
                            } else {
                              setBulkEmail(prev => ({
                                ...prev,
                                selectedPatients: prev.selectedPatients.filter(id => id !== patient.id)
                              }));
                            }
                          }}
                        />
                        <label className="text-sm">{patient.name} ({patient.email})</label>
                      </div>
                    ))}
                    {patientsWithEmail.length === 0 && (
                      <p className="text-sm text-muted-foreground">No patients with email addresses found.</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setBulkEmail(prev => ({ ...prev, selectedPatients: patientsWithEmail.map(p => p.id) }))}
                    >
                      Select All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setBulkEmail(prev => ({ ...prev, selectedPatients: [] }))}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input 
                    value={bulkEmail.title} 
                    onChange={(e) => setBulkEmail(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Email subject"
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea 
                    value={bulkEmail.message} 
                    onChange={(e) => setBulkEmail(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your message for all selected patients"
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSendBulkEmail} 
                  disabled={isLoading || bulkEmail.selectedPatients.length === 0 || !bulkEmail.message}
                  className="w-full"
                >
                  {isLoading ? 'Sending...' : `Send to ${bulkEmail.selectedPatients.length} Patients`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Test Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      Test your email configuration by sending a test email to verify everything is working correctly.
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Test Email Address</Label>
                  <Input 
                    type="email"
                    value={testEmail} 
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email address to test"
                  />
                </div>

                <Button 
                  onClick={handleTestEmail} 
                  disabled={isLoading || !testEmail}
                  className="w-full"
                >
                  {isLoading ? 'Sending Test Email...' : 'Send Test Email'}
                </Button>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Email Configuration Requirements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Set EMAIL_USER in environment variables</li>
                    <li>• Set EMAIL_PASS (app password for Gmail) in environment variables</li>
                    <li>• Ensure patients have email addresses in their profiles</li>
                    <li>• Test email functionality before sending to patients</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}