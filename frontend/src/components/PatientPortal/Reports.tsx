import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Calendar as CalendarIcon, Stethoscope } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Report {
  id: string;
  type: string;
  title: string;
  date: string;
  doctor: string;
  description?: string;
  fileUrl?: string;
  status: 'available' | 'pending' | 'processing';
  [key: string]: unknown;
}

interface ReportsProps {
  reports: Report[];
}

export default function Reports({ reports }: ReportsProps) {
  const getReportTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'blood test': return 'bg-red-100 text-red-800';
      case 'x-ray': return 'bg-blue-100 text-blue-800';
      case 'mri': return 'bg-purple-100 text-purple-800';
      case 'ct scan': return 'bg-green-100 text-green-800';
      case 'ultrasound': return 'bg-yellow-100 text-yellow-800';
      case 'ecg': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewReport = (report: Report) => {
    if (report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    } else {
      // For demo purposes, show alert
      alert(`Viewing ${report.title} - ${report.type}`);
    }
  };

  const handleDownloadReport = (report: Report) => {
    if (report.fileUrl) {
      const link = document.createElement('a');
      link.href = report.fileUrl;
      link.download = `${report.title}_${formatDate(report.date)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For demo purposes, show alert
      alert(`Downloading ${report.title} - ${report.type}`);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Medical Reports</h2>
        <Badge variant="outline" className="w-fit">
          {reports.filter(report => report.status === 'available').length} Available
        </Badge>
      </div>

      <div className="grid gap-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">No medical reports available</p>
              <p className="text-sm text-gray-400 text-center mt-2">
                Your test results and medical reports will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getReportTypeColor(report.type)}>
                      {report.type}
                    </Badge>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Report Date: {formatDate(report.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Ordered by: {report.doctor}</span>
                    </div>
                  </div>

                  {report.description && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {report.status === 'available' && (
                      <>
                        <Button 
                          onClick={() => handleViewReport(report)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Report
                        </Button>
                        <Button 
                          onClick={() => handleDownloadReport(report)}
                          variant="outline"
                          className="flex-1"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </>
                    )}

                    {report.status === 'pending' && (
                      <Button disabled className="w-full">
                        Report Pending
                      </Button>
                    )}

                    {report.status === 'processing' && (
                      <Button disabled className="w-full">
                        Processing...
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {reports.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Report History
                </p>
                <p className="text-xs text-blue-600">
                  Total Reports: {reports.length} | 
                  Available: {reports.filter(r => r.status === 'available').length} | 
                  Pending: {reports.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
