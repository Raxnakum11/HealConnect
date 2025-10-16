# Medicine Import Feature Documentation

## Overview
The Medicine Import feature allows doctors to bulk import medicine inventory data using CSV or JSON files. This feature includes validation, error handling, progress tracking, and template downloads.

## Features

### 1. File Format Support
- **CSV**: Comma-separated values format
- **JSON**: JavaScript Object Notation format

### 2. Import Dialog Components
- **Drag & Drop Interface**: Users can drag files directly onto the upload area
- **File Browser**: Click to browse and select files
- **Progress Tracking**: Real-time upload progress with visual progress bar
- **Template Downloads**: Built-in CSV and JSON template generators
- **Error Reporting**: Detailed error messages for failed imports
- **Success Feedback**: Import results with counts and error details

### 3. Validation
- **Required Fields**: name, batch, quantity, expiryDate
- **Optional Fields**: size, unit, priority, type, manufacturer, description, costPerUnit
- **Data Type Validation**: Numeric fields, date formats, enum values
- **File Size Limit**: 5MB maximum file size
- **File Type Restriction**: Only CSV and JSON files accepted

## API Endpoints

### POST /api/medicines/import
**Description**: Import medicines from uploaded CSV/JSON file
**Authentication**: Bearer token required (Doctor role)
**Content-Type**: multipart/form-data

**Request Body**:
```
FormData with 'file' field containing the CSV/JSON file
```

**Response**:
```json
{
  "success": true,
  "message": "Import completed. 5 medicines imported successfully.",
  "data": {
    "imported": 5,
    "errors": []
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error processing file: Invalid file format",
  "errors": [
    "Row 2: Missing required field 'name'",
    "Row 3: Invalid expiry date format"
  ]
}
```

## Field Specifications

### Required Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| name | string | Medicine name | "Paracetamol" |
| batch | string | Batch number | "PCM001" |
| quantity | number | Stock quantity | 100 |
| expiryDate | string | Expiry date (YYYY-MM-DD) | "2025-12-31" |

### Optional Fields
| Field | Type | Default | Valid Values | Description |
|-------|------|---------|--------------|-------------|
| size | string | "" | Any string | Medicine size/strength |
| unit | string | "tablets" | mg, g, ml, tablets, capsules, drops, syrup | Unit of measurement |
| priority | string | "medium" | high, medium, low | Priority level |
| type | string | "clinic" | clinic, camp, others | Medicine type/location |
| manufacturer | string | "" | Any string | Manufacturer name |
| description | string | "" | Any string | Medicine description |
| costPerUnit | number | 0 | Any positive number | Cost per unit |

## File Format Examples

### CSV Format
```csv
name,batch,quantity,size,unit,expiryDate,priority,type,manufacturer,description,costPerUnit
Paracetamol,PCM001,100,500,mg,2025-12-31,medium,clinic,Generic Pharma,Pain relief medication,2.50
Amoxicillin,AMX002,50,250,mg,2026-06-30,high,clinic,MediCore,Antibiotic,5.00
```

### JSON Format
```json
[
  {
    "name": "Paracetamol",
    "batch": "PCM001",
    "quantity": 100,
    "size": "500",
    "unit": "mg",
    "expiryDate": "2025-12-31",
    "priority": "medium",
    "type": "clinic",
    "manufacturer": "Generic Pharma",
    "description": "Pain relief medication",
    "costPerUnit": 2.50
  }
]
```

## Usage Instructions

### For Users
1. **Access Import**: Click the "Import" button in the Medicine Inventory section
2. **Choose Template**: Download CSV or JSON templates from the Templates tab
3. **Prepare Data**: Fill in your medicine data using the template format
4. **Upload File**: Drag & drop or browse to select your file
5. **Review Results**: Check import results and address any errors
6. **Refresh**: Inventory will automatically refresh after successful import

### For Developers
1. **Backend Setup**: 
   - Install required packages: `npm install multer csv-parser`
   - Import controller handles file processing and validation
   - Uploads are temporarily stored in `/uploads` directory

2. **Frontend Integration**:
   - Import dialog component: `ImportMedicinesDialog`
   - API integration: `api.medicines.importMedicines(file)`
   - Progress tracking and error handling included

## Error Handling

### Common Errors
- **File Format**: Only CSV and JSON files are accepted
- **File Size**: Maximum 5MB file size limit
- **Missing Fields**: Required fields must be present
- **Invalid Dates**: Expiry dates must be in YYYY-MM-DD format
- **Invalid Numbers**: Quantity and cost must be valid numbers
- **Enum Values**: Unit, priority, and type must match valid options

### Error Recovery
- Errors are reported per row with specific messages
- Valid records are still imported even if some rows have errors
- Detailed error feedback helps users correct their data

## Security Features
- **Authentication**: Requires valid doctor authentication token
- **File Validation**: Strict file type and size validation
- **Data Sanitization**: Input data is validated and sanitized
- **Temporary Storage**: Uploaded files are automatically deleted after processing

## Performance Considerations
- **File Size Limit**: 5MB maximum to prevent server overload
- **Batch Processing**: Records are processed in batches for efficiency
- **Memory Management**: Files are streamed for CSV processing
- **Progress Feedback**: Real-time progress updates for user experience

## Testing Files
Test files are included in the project root:
- `test_medicines.csv`: Sample CSV data for testing
- `test_medicines.json`: Sample JSON data for testing

## Troubleshooting

### Common Issues
1. **Import Button Not Working**: Check if user is logged in and has doctor role
2. **File Upload Fails**: Verify file size is under 5MB and format is CSV/JSON
3. **Validation Errors**: Check that required fields are present and properly formatted
4. **Server Errors**: Ensure backend server is running and database is connected

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify API endpoint is accessible at `/api/medicines/import`
3. Check server logs for detailed error messages
4. Test with provided sample files first