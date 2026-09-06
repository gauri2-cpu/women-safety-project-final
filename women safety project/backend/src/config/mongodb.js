/**
 * MongoDB Configuration
 * Using Mongoose ODM for database operations
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * Uses MONGODB_URI from .env or defaults to local MongoDB
 */
async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/women-safety';
    
    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    if (!process.env.MONGODB_URI) {
      console.error('💡 Tip: Set MONGODB_URI in .env or ensure local MongoDB is running');
      console.error('   Local: mongodb://localhost:27017/women-safety');
      console.error('   Cloud: mongodb+srv://username:password@cluster.mongodb.net/women-safety');
    }
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  mongoose
};
