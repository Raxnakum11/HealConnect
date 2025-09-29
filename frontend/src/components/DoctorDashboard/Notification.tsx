import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Smartphone, Bell } from 'lucide-react';

interface NotificationProps {
  setNotificationData: (data: { type: string; title: string; message: string }) => void;
  setShowNotificationService: (show: boolean) => void;
}

const Notification: React.FC<NotificationProps> = ({
  setNotificationData,
  setShowNotificationService
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Patient Notifications</h2>
        <Button onClick={() => {
          setNotificationData({ type: 'manual', message: '', title: '' });
          setShowNotificationService(true);
        }}>
          <Send className="mr-2 h-4 w-4" />
          Send Manual Notification
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-full">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">WhatsApp Notifications</h3>
              <p className="text-sm text-blue-700">Send instant messages via WhatsApp</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-full">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">SMS Notifications</h3>
              <p className="text-sm text-green-700">Send text messages to all patients</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-full">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">Auto Notifications</h3>
              <p className="text-sm text-purple-700">Automatic alerts for camps & prescriptions</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Notification Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Camp Announcement</h4>
              <p className="text-sm text-muted-foreground mb-3">
                "Dear Patient, A new health camp has been organized. Please visit our clinic for more details."
              </p>
              <Button size="sm" onClick={() => {
                setNotificationData({
                  type: 'camp',
                  title: 'Health Camp Announcement',
                  message: 'Dear Patient, A new health camp has been organized. Please visit our clinic for more details. - Dr. Himanshu Sonagara, Shree Hari Clinic'
                });
                setShowNotificationService(true);
              }}>
                Use Template
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Prescription Ready</h4>
              <p className="text-sm text-muted-foreground mb-3">
                "Dear Patient, Your prescription is ready for collection. Please visit our clinic."
              </p>
              <Button size="sm" onClick={() => {
                setNotificationData({
                  type: 'prescription',
                  title: 'Prescription Ready',
                  message: 'Dear Patient, Your prescription is ready for collection. Please visit our clinic at your convenience. - Dr. Himanshu Sonagara, Shree Hari Clinic'
                });
                setShowNotificationService(true);
              }}>
                Use Template
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Report Available</h4>
              <p className="text-sm text-muted-foreground mb-3">
                "Dear Patient, Your medical report is ready. Please visit our clinic to collect it."
              </p>
              <Button size="sm" onClick={() => {
                setNotificationData({
                  type: 'report',
                  title: 'Medical Report Ready',
                  message: 'Dear Patient, Your medical report is ready. Please visit our clinic to collect it. - Dr. Himanshu Sonagara, Shree Hari Clinic'
                });
                setShowNotificationService(true);
              }}>
                Use Template
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Appointment Reminder</h4>
              <p className="text-sm text-muted-foreground mb-3">
                "Dear Patient, This is a reminder for your upcoming appointment. Please arrive on time."
              </p>
              <Button size="sm" onClick={() => {
                setNotificationData({
                  type: 'manual',
                  title: 'Appointment Reminder',
                  message: 'Dear Patient, This is a reminder for your upcoming appointment. Please arrive on time. - Dr. Himanshu Sonagara, Shree Hari Clinic'
                });
                setShowNotificationService(true);
              }}>
                Use Template
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default Notification;
