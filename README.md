# 🏥 HealConnect - Comprehensive Homeopathy Management System

<div align="center">

![HealConnect Logo](https://img.shields.io/badge/HealConnect-Healthcare%20Management-blue?style=for-the-badge)

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6%2B-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

*A modern, full-stack healthcare management platform designed specifically for homeopathy clinics and medical camps*

[🌟 Features](#features) | [🚀 Quick Start](#quick-start) | [📖 Documentation](#documentation) | [🤝 Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Installation Guide](#installation-guide)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Support](#support)

---

## 🌟 Overview

HealConnect is a comprehensive healthcare management system specifically designed for homeopathy clinics and medical camps. It streamlines patient management, appointment scheduling, prescription handling, and medical camp organization with an intuitive, modern interface.

### 🎯 Purpose

- **For Doctors**: Manage patients, appointments, prescriptions, and medical camps efficiently
- **For Patients**: Book appointments, view prescriptions, and access medical history
- **For Clinics**: Organize medical camps, manage inventory, and maintain comprehensive records

---

## ✨ Features

### 👨‍⚕️ Doctor Dashboard
- **Patient Management**: Complete patient records with medical history
- **Appointment Scheduling**: View, manage, and track appointments
- **Prescription System**: Create and manage digital prescriptions
- **Medical Camp Organization**: Plan and conduct medical camps
- **Analytics**: Patient statistics and appointment insights

### 👥 Patient Portal
- **Appointment Booking**: Easy online appointment scheduling
- **Medical History**: Access to complete medical records
- **Prescription Viewing**: Digital prescription access
- **Camp Registration**: Register for medical camps

### 🔐 Security & Authentication
- **JWT Authentication**: Secure login system
- **Role-based Access**: Different permissions for doctors and patients
- **Email Verification**: Account verification system
- **Password Encryption**: bcrypt password hashing

### 📊 Management Features
- **Medicine Inventory**: Track and manage medicine stock
- **Camp Management**: Organize and conduct medical camps
- **Notification System**: Email notifications for appointments
- **Data Analytics**: Comprehensive reporting and statistics

---

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI components
- **React Router** - Client-side routing

### Development & Tools
- **ESLint** - Code linting
- **Git** - Version control
- **npm** - Package manager

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (v6 or higher)
- **Git**
- **Gmail account** (for email notifications)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Aryan1438/HealConnect.git
cd HealConnect
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  
# Edit .env with your configuration
npm run dev
```

### 4️⃣ Access Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:9000
- **Demo Doctor**: Login with mobile `9999999999`

---

## 📦 Installation Guide

### Detailed Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file**
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/healconnect_db
   
   # JWT Security  
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   
   # Email Configuration
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   
   # Server Configuration
   PORT=9000
   CORS_ORIGIN=http://localhost:8080
   ```

4. **Start Database**
   ```bash
   # Install MongoDB locally or use MongoDB Atlas
   # For Ubuntu/WSL:
   sudo systemctl start mongod
   
   # For macOS:
   brew services start mongodb/brew/mongodb-community
   
   # For Windows:
   # Start MongoDB service from Services panel
   ```

5. **Run Backend**
   ```bash
   npm run dev
   ```

### Detailed Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file**
   ```env
   VITE_API_URL=http://localhost:9000/api
   VITE_API_DEBUG=true
   ```

4. **Run Frontend**
   ```bash
   npm run dev
   ```

---

## ⚙️ Configuration

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account Settings → Security → App passwords
3. Generate a password for "Mail"
4. Use this generated password in `EMAIL_PASS`

### MongoDB Configuration

**Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/healconnect_db
```

**MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healconnect_db
```

### JWT Security
Generate a strong JWT secret:
```bash
# Method 1: OpenSSL
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📚 Usage

### Demo Accounts

**Demo Doctor:**
- Mobile: `9999999999`
- Name: Any name
- Role: Doctor
- Features: Full access to all doctor features

**Demo Patient:**
- Mobile: `9876543210`  
- Name: John Doe
- Role: Patient
- Features: Patient portal access

### Core Workflows

#### 1. Doctor Workflow
1. **Login** as doctor
2. **View Dashboard** with patient statistics
3. **Manage Appointments** - view, confirm, reschedule
4. **Add Patients** with complete medical history
5. **Create Prescriptions** with detailed medication
6. **Organize Medical Camps**

#### 2. Patient Workflow
1. **Login** as patient
2. **Book Appointments** with preferred time slots
3. **View Medical History** and prescriptions
4. **Register for Medical Camps**
5. **Receive Email Notifications**

---

## 📡 API Documentation

### Base URL
```
http://localhost:9000/api
```

### Authentication Endpoints
```http
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login user
GET  /api/auth/me         # Get current user
POST /api/auth/logout     # Logout user
```

### Patient Endpoints
```http
GET    /api/patients           # Get all patients (Doctor only)
POST   /api/patients          # Create new patient
GET    /api/patients/:id      # Get patient details
PUT    /api/patients/:id      # Update patient
DELETE /api/patients/:id      # Delete patient (Doctor only)
```

### Appointment Endpoints
```http
GET  /api/appointments                # Get appointments
POST /api/appointments               # Create appointment
GET  /api/appointments/doctor        # Get doctor appointments
GET  /api/appointments/patient       # Get patient appointments
PUT  /api/appointments/:id/status    # Update appointment status
PUT  /api/appointments/:id/cancel    # Cancel appointment
```

### Medicine Endpoints
```http
GET    /api/medicines         # Get all medicines
POST   /api/medicines        # Add new medicine (Doctor only)
GET    /api/medicines/:id    # Get medicine details
PUT    /api/medicines/:id    # Update medicine (Doctor only)
DELETE /api/medicines/:id    # Delete medicine (Doctor only)
```

### Medical Camp Endpoints
```http
GET    /api/camps            # Get all camps
POST   /api/camps           # Create new camp (Doctor only)
GET    /api/camps/:id       # Get camp details
PUT    /api/camps/:id       # Update camp (Doctor only)
DELETE /api/camps/:id       # Delete camp (Doctor only)
```

---

## 🔒 Security

### Security Features
- **JWT Authentication** with secure token management
- **Password Hashing** using bcrypt with salt rounds
- **CORS Protection** with configurable origins
- **Rate Limiting** to prevent abuse
- **Input Validation** using express-validator
- **Environment Variables** for sensitive configuration
- **Helmet** for security headers

### Security Best Practices
- All passwords are hashed with bcrypt
- JWT tokens expire after 7 days
- Environment variables protect sensitive data
- CORS configured for specific origins only
- API rate limiting prevents abuse
- Input validation on all endpoints

### Data Protection
- Personal data is encrypted
- Email addresses are protected
- Database credentials are secured
- No sensitive data in version control

---

## 🤝 Contributing

We welcome contributions to HealConnect! Here's how you can help:

### Getting Started
1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a new branch for your feature
4. **Make** your changes
5. **Test** thoroughly
6. **Submit** a pull request

### Development Guidelines
- Follow TypeScript and ESLint configurations
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure code is properly formatted

---

## 🆘 Support

### Getting Help
- **Documentation**: Read this README thoroughly
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join GitHub Discussions for questions

### Common Issues

**Database Connection Issues:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

**Port Already in Use:**
```bash
# Find process using port 9000
netstat -ano | findstr :9000

# Kill the process (replace PID)
taskkill /F /PID <process_id>
```

**Email Service Not Working:**
- Verify Gmail App Password is correct
- Check 2-Factor Authentication is enabled
- Ensure EMAIL_USER and EMAIL_PASS are set in .env

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the HealConnect team**

[⬆️ Back to Top](#-healconnect---comprehensive-homeopathy-management-system)

</div>

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