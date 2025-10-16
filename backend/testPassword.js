const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/healthcare', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'patient@example.com' });
    if (user) {
      console.log('User found:', {
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash: user.password ? 'exists' : 'missing'
      });
      
      // Test password comparison
      const testPassword = 'password123';
      console.log('Testing password:', testPassword);
      
      // Direct bcrypt comparison
      const directMatch = await bcrypt.compare(testPassword, user.password);
      console.log('Direct bcrypt compare result:', directMatch);
      
      // User method comparison
      try {
        const methodMatch = await user.comparePassword(testPassword);
        console.log('User method compare result:', methodMatch);
      } catch (error) {
        console.error('User method error:', error);
      }
    } else {
      console.log('User not found');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });