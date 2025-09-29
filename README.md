# SGP Homeopathy Management System - Setup Guide

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Edit `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/sgp_homeopathy
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For Windows (if MongoDB service is not running)
net start MongoDB

# For macOS
brew services start mongodb-community

# For Linux
sudo systemctl start mongod
```

### 4. Start Backend Server
```bash
npm run dev
```

The backend will be available at: `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies
```bash
cd ..
npm install
```

### 2. Environment Configuration
Make sure `.env` file exists in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

### 3. Start Frontend Development Server
```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with mobile number and name
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Patients (Doctor only)
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `POST /api/patients/:id/visits` - Add visit to patient

### Medicines (Doctor only)
- `GET /api/medicines` - Get all medicines
- `POST /api/medicines` - Add new medicine
- `GET /api/medicines/:id` - Get medicine details
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine
- `PATCH /api/medicines/:id/quantity` - Update medicine quantity

### Camps (Doctor only)
- `GET /api/camps` - Get all camps
- `POST /api/camps` - Create new camp
- `GET /api/camps/:id` - Get camp details
- `PUT /api/camps/:id` - Update camp
- `DELETE /api/camps/:id` - Delete camp
- `PATCH /api/camps/:id/complete` - Mark camp as completed

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription (Doctor only)
- `GET /api/prescriptions/:id` - Get prescription details
- `PUT /api/prescriptions/:id` - Update prescription (Doctor only)
- `DELETE /api/prescriptions/:id` - Delete prescription (Doctor only)

## Features

### Mobile Number Authentication
- No email or password required
- Simply enter mobile number and name
- Automatic user creation on first login
- Role-based access (Doctor/Patient)

### Doctor Features
- Patient management
- Medicine inventory
- Camp organization
- Prescription management
- Dashboard with statistics

### Patient Features
- View personal medical records
- Access prescription history
- View upcoming appointments

## Database Schema

### Users Collection
- Mobile number (unique identifier)
- Name, role (doctor/patient)
- Specialization (for doctors)
- Auto-generated email and password

### Patients Collection
- Patient demographics
- Visit history
- Associated doctor and camps
- Medical records

### Medicines Collection
- Medicine inventory
- Batch tracking
- Expiry management
- Usage tracking

### Camps Collection
- Camp scheduling
- Patient count tracking
- Medicine usage
- Location management

### Prescriptions Collection
- Medicine prescriptions
- Dosage instructions
- Patient-doctor linkage
- Visit correlation