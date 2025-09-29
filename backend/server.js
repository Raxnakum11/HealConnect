const path = require('path');

// Try multiple approaches to load .env file
const envPath = path.join(__dirname, '.env');
console.log('Trying to load .env from:', envPath);

// First try: from current directory
require('dotenv').config({ path: envPath });

// If still undefined, try from current working directory
if (!process.env.MONGODB_URI) {
  const cwd_env = path.join(process.cwd(), '.env');
  console.log('Trying to load .env from cwd:', cwd_env);
  require('dotenv').config({ path: cwd_env });
}

// If still undefined, try without path (defaults to .env in current working directory)
if (!process.env.MONGODB_URI) {
  console.log('Trying to load .env with default config');
  require('dotenv').config();
}

// Manual fallback for development
if (!process.env.MONGODB_URI) {
  console.log('Setting manual fallback for environment variables');
  process.env.MONGODB_URI = 'mongodb://localhost:27017/healconnect_db';
  process.env.JWT_SECRET = 'healconnect_super_secret_jwt_key_2025';
  process.env.PORT = '9000'; // Use port 9000 to avoid conflicts
  process.env.NODE_ENV = 'development';
  process.env.CORS_ORIGIN = 'http://localhost:8080';
  // Email configuration fallback
  process.env.EMAIL_USER = 'abc592052@gmail.com';
  process.env.EMAIL_PASS = 'kpqo ettk cfgo zcrm';
}

console.log('Final MONGODB_URI:', process.env.MONGODB_URI);
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/database');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const medicineRoutes = require('./src/routes/medicineRoutes');
const campRoutes = require('./src/routes/campRoutes');
const prescriptionRoutes = require('./src/routes/prescriptionRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('combined'));
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SGP Homeopathy API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/appointments', appointmentRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to SGP Homeopathy Management System API',
    version: '1.0.0',
    documentation: '/api/docs', // Future: API documentation endpoint
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      medicines: '/api/medicines',
      camps: '/api/camps',
      prescriptions: '/api/prescriptions'
    }
  });
});

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                    SGP Homeopathy Management System                    ║
║                              Backend API                               ║
╠════════════════════════════════════════════════════════════════════════╣
║  Server is running on port ${PORT}                                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}                                     ║
║  Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}                                        ║
║                                                                        ║
║  API Endpoints:                                                        ║
║  • Health Check: http://localhost:${PORT}/health                        ║
║  • Authentication: http://localhost:${PORT}/api/auth                     ║
║  • Patients: http://localhost:${PORT}/api/patients                      ║
║  • Medicines: http://localhost:${PORT}/api/medicines                    ║
║  • Camps: http://localhost:${PORT}/api/camps                           ║
║  • Prescriptions: http://localhost:${PORT}/api/prescriptions           ║
╚════════════════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

module.exports = app;