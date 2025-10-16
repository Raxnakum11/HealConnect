const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/healconnect_db', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Drop all collections
    await mongoose.connection.db.dropDatabase();
    console.log('Database cleared successfully');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error clearing database:', err);
    process.exit(1);
  });