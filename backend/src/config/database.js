const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('=== Environment Debug Info ===');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    console.log('MONGODB_URI type:', typeof process.env.MONGODB_URI);
    console.log('All MONGO env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
    console.log('Current working directory:', process.cwd());
    console.log('===============================');
    
    // Check if MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not provided. Server will run without database connection.');
      console.warn('⚠️  Some API endpoints may not work without database.');
      return null;
    }

    // MongoDB connection options
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`Database Name: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('Mongoose connection closed due to application termination');
        process.exit(0);
      } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️  Server will continue without database connection.');
    console.warn('⚠️  Please ensure MongoDB is running and accessible.');
    return null;
  }
};

module.exports = connectDB;