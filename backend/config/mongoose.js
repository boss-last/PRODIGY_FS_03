const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mama_africa_db');
    console.log(`✅ MongoDB Connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
