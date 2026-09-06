/**
 * Women Safety Website - Backend Server
 * Main entry point for the Express API
 * 
 * Features:
 * - User authentication (Email/Phone signup and guest login)
 * - Trusted contacts management
 * - SOS alert system with SMS/WhatsApp notifications
 * - Alert history and logging
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import routes
const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const sosRoutes = require('./routes/sosRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const evidenceRoutes = require('./routes/evidenceRoutes');
const riskRoutes = require('./routes/riskRoutes');

// Import database (JSON files)
const { initializeDatabase } = require('./config/database');

// Initialize Express app
const app = express();

// ========================
// MIDDLEWARE SETUP
// ========================

// Parse incoming requests
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Enable CORS (Cross-Origin Resource Sharing)
// Allow requests from frontend (local and deployed)
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-user-id']
};
app.use(cors({
  origin: true,
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ========================
// ROUTES SETUP
// ========================

// Health check routes
app.use('/api', healthRoutes);

// User authentication routes
app.use('/api/users', userRoutes);

// Trusted contacts routes
app.use('/api/contacts', contactRoutes);

// SOS alert routes
app.use('/api/sos', sosRoutes);

// Payment/Subscription routes (NEW)
app.use('/api/payments', paymentRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Evidence routes
app.use('/api/evidence', evidenceRoutes);

// Risk assessment routes
app.use('/api/risk', riskRoutes);

// 404 Handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========================
// SERVER STARTUP
// ========================

const PORT = process.env.PORT || 5000;

// Start server with JSON file database
async function startServer() {
  try {
    // Initialize JSON database
    initializeDatabase();

    app.listen(PORT, '127.0.0.1', () => {
      console.log(`\n========================================`);
      console.log(`Women Safety Website Backend`);
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: JSON Files`);
      console.log(`========================================\n`);

      console.log('Available API Endpoints:');
      console.log('- GET  /api/health - Health check');
      console.log('- POST /api/users/guest-login - Guest login');
      console.log('- POST /api/users/signup - User signup');
      console.log('- POST /api/users/login - User login');
      console.log('- GET  /api/users/profile - Get user profile');
      console.log('- PUT  /api/users/profile - Update user profile');
      console.log('- POST /api/contacts - Add trusted contact');
      console.log('- GET  /api/contacts - Get user contacts');
      console.log('- PUT  /api/contacts/:contactId - Update contact');
      console.log('- DELETE /api/contacts/:contactId - Delete contact');
      console.log('- POST /api/sos/trigger - Trigger SOS alert');
      console.log('- GET  /api/sos/alerts - Get alert history');
      console.log('- GET  /api/sos/alerts/:alertId - Get alert details');
      console.log('- PUT  /api/sos/alerts/:alertId/resolve - Resolve alert\n');
      console.log('- GET  /api/admin/users - List all users (admin)');
      console.log('- GET  /api/admin/contacts - List all contacts (admin)');
      console.log('- GET  /api/admin/stats - System stats (admin)');
      console.log('- DELETE /api/admin/users/:id - Delete user (admin)');
      console.log('- DELETE /api/admin/contacts/:id - Delete contact (admin)\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
