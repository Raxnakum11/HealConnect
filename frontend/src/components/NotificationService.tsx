import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Smartphone, Bell, Users, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'whatsapp' | 'sms' | 'both';
  message: string;
  patientNumbers: string[];
  status: 'pending' | 'sent' | 'failed';
  timestamp: string;
  triggerType: 'camp' | 'prescription' | 'report' | 'manual';
  title: string;
}

interface NotificationServiceProps {
  isOpen: boolean;
  onClose: () => void;
  notificationType?: 'camp' | 'prescription' | 'report' | 'manual';
  initialMessage?: string;
  initialTitle?: string;
}

export function NotificationService({ isOpen, onClose, notificationType = 'manual', initialMessage = '', initialTitle = '' }: NotificationServiceProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('send');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [newNotification, setNewNotification] = useState({
    type: 'both' as 'whatsapp' | 'sms' | 'both',
    title: initialTitle,
    message: initialMessage,
    targetAudience: 'all' as 'all' | 'recent' | 'custom',
    customNumbers: '',
    whatsappApiKey: '',
    smsApiKey: ''
  });

  React.useEffect(() => {
    const savedNotifications = localStorage.getItem('doctor_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  React.useEffect(() => {
    if (initialMessage || initialTitle) {
      setNewNotification(prev => ({
        ...prev,
        title: initialTitle,
        message: initialMessage
      }));
    }
  }, [initialMessage, initialTitle]);

  const getPatientNumbers = () => {
    const patients = JSON.parse(localStorage.getItem('doctor_patients') || '[]');
    
    interface PatientData {
      mobile: string;
      [key: string]: unknown;
    }
    
    switch (newNotification.targetAudience) {
      case 'recent':
        return patients.slice(0, 20).map((p: PatientData) => p.mobile);
      case 'custom':
        return newNotification.customNumbers.split(',').map((num: string) => num.trim()).filter(Boolean);
      default:
        return patients.map((p: PatientData) => p.mobile);
    }
  };

  const sendNotification = async () => {
    if (!newNotification.message || !newNotification.title) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and message",
        variant: "destructive"
      });
      return;
    }

    const patientNumbers = getPatientNumbers();
    
    if (patientNumbers.length === 0) {
      toast({
        title: "No Recipients",
        description: "No patient numbers found to send notifications",
        variant: "destructive"
      });
      return;
    }

    const notification: Notification = {
      id: `not_${Date.now()}`,
      type: newNotification.type,
      message: newNotification.message,
      patientNumbers,
      status: 'pending',
      timestamp: new Date().toISOString(),
      triggerType: notificationType,
      title: newNotification.title
    };

    try {
      // Simulate sending notifications
      await simulateNotificationSending(notification);
      
      const updatedNotifications = [notification, ...notifications];
      setNotifications(updatedNotifications);
      localStorage.setItem('doctor_notifications', JSON.stringify(updatedNotifications));
      
      // Add to patient notifications
      const patientNotification = {
        id: `pat_${Date.now()}`,
        type: notificationType,
        title: newNotification.title,
        message: newNotification.message,
        date: new Date().toISOString(),
        read: false,
        priority: 'high'
      };
      
      const existingPatientNotifications = JSON.parse(localStorage.getItem('patient_notifications') || '[]');
      localStorage.setItem('patient_notifications', JSON.stringify([patientNotification, ...existingPatientNotifications]));

      toast({
        title: "Notifications Sent",
        description: `${newNotification.type.toUpperCase()} notifications sent to ${patientNumbers.length} patients`,
      });

      setNewNotification({
        type: 'both',
        title: '',
        message: '',
        targetAudience: 'all',
        customNumbers: '',
        whatsappApiKey: '',
        smsApiKey: ''
      });

      onClose();
    } catch (error) {
      toast({
        title: "Failed to Send",
        description: "Error sending notifications. Please try again.",
        variant: "destructive"
      });
    }
  };

  const simulateNotificationSending = async (notification: Notification): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        notification.status = 'sent';
        resolve();
      }, 1500);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-medical-dark flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Patient Notification Center
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send">Send Notification</TabsTrigger>
            <TabsTrigger value="history">Notification History</TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Notification Title</Label>
                  <Input
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter notification title"
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your message here..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Notification Type</Label>
                  <Select 
                    value={newNotification.type} 
                    onValueChange={(value: 'whatsapp' | 'sms' | 'both') => 
                      setNewNotification(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          WhatsApp Only
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          SMS Only
                        </div>
                      </SelectItem>
                      <SelectItem value="both">
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Both WhatsApp & SMS
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Target Audience</Label>
                  <Select 
                    value={newNotification.targetAudience} 
                    onValueChange={(value: 'all' | 'recent' | 'custom') => 
                      setNewNotification(prev => ({ ...prev, targetAudience: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          All Registered Patients
                        </div>
                      </SelectItem>
                      <SelectItem value="recent">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Recent Patients (Last 20)
                        </div>
                      </SelectItem>
                      <SelectItem value="custom">Custom Numbers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newNotification.targetAudience === 'custom' && (
                  <div>
                    <Label>Custom Phone Numbers</Label>
                    <Textarea
                      value={newNotification.customNumbers}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, customNumbers: e.target.value }))}
                      placeholder="Enter phone numbers separated by commas (e.g., 9876543210, 9123456789)"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
                  <CardHeader>
                    <CardTitle className="text-sm">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="font-semibold text-medical-dark">
                        {newNotification.title || 'Notification Title'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {newNotification.message || 'Your message will appear here...'}
                      </div>
                      <div className="text-xs text-primary font-medium">
                        - Dr. Himanshu Sonagara, Shree Hari Clinic
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Delivery Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Recipients:</span>
                      <Badge variant="secondary">
                        {getPatientNumbers().length} patients
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery via:</span>
                      <Badge variant="outline">
                        {newNotification.type === 'both' ? 'WhatsApp + SMS' : 
                         newNotification.type === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={sendNotification} className="w-full" variant="default">
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No notifications sent yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Card key={notification.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          notification.status === 'sent' ? 'default' :
                          notification.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {notification.status}
                        </Badge>
                        <Badge variant="outline">{notification.type}</Badge>
                        <Badge variant="outline">{notification.triggerType}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-medical-dark mb-1">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <div className="text-xs text-muted-foreground">
                      Sent to {notification.patientNumbers.length} patients
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}