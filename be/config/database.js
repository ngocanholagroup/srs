const mongoose = require('mongoose');

const connectDatabase = async () => {
  const dbUri = process.env.DB_URI || 'mongodb://127.0.0.1:27017/srs_db';
  await mongoose.connect(dbUri);
  console.log('Connected to MongoDB:', dbUri);
};

module.exports = { connectDatabase };
