import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface ImportMedicinesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

interface ImportResult {
  imported: number;
  errors: string[];
}

const ImportMedicinesDialog: React.FC<ImportMedicinesDialogProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.type === 'application/json' || 
          file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV or JSON file",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV or JSON file to import",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setImportResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const data = await api.medicines.importMedicines(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (data.success) {
        setImportResult(data.data);
        toast({
          title: "Import successful",
          description: `${data.data.imported} medicines imported successfully`
        });
        onImportSuccess();
      } else {
        toast({
          title: "Import failed",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: error.message || "An error occurred while importing medicines",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = (type: 'csv' | 'json') => {
    const sampleData = [
      {
        name: "Paracetamol",
        batch: "PCM001",
        quantity: 100,
        size: "500",
        unit: "mg",
        expiryDate: "2025-12-31",
        priority: "medium",
        type: "clinic",
        manufacturer: "Generic Pharma",
        description: "Pain relief medication",
        costPerUnit: 2.50
      },
      {
        name: "Amoxicillin",
        batch: "AMX002",
        quantity: 50,
        size: "250",
        unit: "mg",
        expiryDate: "2026-06-30",
        priority: "high",
        type: "clinic",
        manufacturer: "MediCore",
        description: "Antibiotic",
        costPerUnit: 5.00
      }
    ];

    let content = '';
    let filename = '';
    let mimeType = '';

    if (type === 'csv') {
      const headers = Object.keys(sampleData[0]).join(',');
      const rows = sampleData.map(item => Object.values(item).join(',')).join('\n');
      content = headers + '\n' + rows;
      filename = 'medicine_import_template.csv';
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(sampleData, null, 2);
      filename = 'medicine_import_template.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: `${type.toUpperCase()} template downloaded successfully`
    });
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setImportResult(null);
    setDragActive(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Medicines
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="templates">Download Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* File Upload Section */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
              <CardContent 
                className={`p-6 text-center ${dragActive ? 'bg-blue-50' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                
                {selectedFile ? (
                  <div className="space-y-3">
                    <FileText className="w-12 h-12 mx-auto text-green-600" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFile(null)}
                      size="sm"
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">Drop your file here</p>
                      <p className="text-sm text-gray-500">
                        or click to browse (CSV, JSON files only)
                      </p>
                    </div>
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Browse Files
                      </Button>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {isUploading && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Import Results */}
            {importResult && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Import Complete</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Badge variant="default" className="w-fit">
                        {importResult.imported} medicines imported successfully
                      </Badge>
                      
                      {importResult.errors.length > 0 && (
                        <div className="space-y-2">
                          <Badge variant="destructive" className="w-fit">
                            {importResult.errors.length} errors found
                          </Badge>
                          <div className="max-h-32 overflow-y-auto">
                            {importResult.errors.map((error, index) => (
                              <Alert key={index} variant="destructive" className="py-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  {error}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Import Button */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={!selectedFile || isUploading}
                className="min-w-[100px]"
              >
                {isUploading ? "Importing..." : "Import"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Download template files to see the required format for importing medicines.
                Make sure to follow the exact field names and data types.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="font-medium">CSV Template</h3>
                        <p className="text-sm text-gray-500">
                          Comma-separated values format
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => downloadTemplate('csv')}
                      variant="outline" 
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium">JSON Template</h3>
                        <p className="text-sm text-gray-500">
                          JavaScript Object Notation format
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => downloadTemplate('json')}
                      variant="outline" 
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Field Descriptions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Required Fields</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <Badge variant="destructive" className="mb-1">Required</Badge>
                    <ul className="space-y-1 text-gray-600">
                      <li><strong>name:</strong> Medicine name</li>
                      <li><strong>batch:</strong> Batch number</li>
                      <li><strong>quantity:</strong> Quantity (number)</li>
                      <li><strong>expiryDate:</strong> YYYY-MM-DD format</li>
                    </ul>
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-1">Optional</Badge>
                    <ul className="space-y-1 text-gray-600">
                      <li><strong>size:</strong> Medicine size</li>
                      <li><strong>unit:</strong> mg, g, ml, tablets, etc.</li>
                      <li><strong>priority:</strong> high, medium, low</li>
                      <li><strong>type:</strong> clinic, camp, others</li>
                      <li><strong>manufacturer:</strong> Manufacturer name</li>
                      <li><strong>description:</strong> Description</li>
                      <li><strong>costPerUnit:</strong> Cost per unit</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImportMedicinesDialog;