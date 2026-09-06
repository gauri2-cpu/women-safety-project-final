/**
 * Health Check Routes
 * Simple routes for testing API status
 */

const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API status endpoint
router.get('/status', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API is operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
