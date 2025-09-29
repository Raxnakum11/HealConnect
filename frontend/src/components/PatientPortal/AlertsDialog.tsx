import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, CheckCircle, X, Eye, Trash2 } from 'lucide-react';

interface Alert {
  id: string;
  type: 'appointment' | 'medicine' | 'camp' | 'report' | 'general';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface AlertsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  alerts: Alert[];
  markAsRead: (alertId: string) => void;
  deleteAlert: (alertId: string) => void;
}

export default function AlertsDialog({
  isOpen,
  onOpenChange,
  alerts,
  markAsRead,
  deleteAlert
}: AlertsDialogProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-800';
      case 'medicine': return 'bg-purple-100 text-purple-800';
      case 'camp': return 'bg-green-100 text-green-800';
      case 'report': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <CheckCircle className="h-4 w-4" />;
      case 'medicine': return <AlertTriangle className="h-4 w-4" />;
      case 'camp': return <Bell className="h-4 w-4" />;
      case 'report': return <Eye className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.read);
  const readAlerts = alerts.filter(alert => alert.read);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadAlerts.length > 0 && (
              <Badge variant="destructive">{unreadAlerts.length}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications</p>
              <p className="text-sm text-gray-400 mt-2">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Unread Alerts */}
              {unreadAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    New Notifications
                    <Badge variant="outline">{unreadAlerts.length}</Badge>
                  </h3>
                  {unreadAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getTypeColor(alert.type)}>
                              <div className="flex items-center gap-1">
                                {getTypeIcon(alert.type)}
                                {alert.type}
                              </div>
                            </Badge>
                            <Badge className={getPriorityColor(alert.priority)}>
                              {alert.priority}
                            </Badge>
                            <span className="text-xs text-gray-500">{alert.time}</span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(alert.id)}
                            title="Mark as read"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteAlert(alert.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Read Alerts */}
              {readAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    Read Notifications
                    <Badge variant="secondary">{readAlerts.length}</Badge>
                  </h3>
                  {readAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3 opacity-75"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className={getTypeColor(alert.type)}>
                              <div className="flex items-center gap-1">
                                {getTypeIcon(alert.type)}
                                {alert.type}
                              </div>
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(alert.priority)}>
                              {alert.priority}
                            </Badge>
                            <span className="text-xs text-gray-500">{alert.time}</span>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <h4 className="font-medium text-gray-700 mb-1">{alert.title}</h4>
                          <p className="text-sm text-gray-500">{alert.message}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAlert(alert.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            Total: {alerts.length} | Unread: {unreadAlerts.length}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
