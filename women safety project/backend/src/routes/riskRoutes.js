/**
 * Risk Routes
 * Routes for risk assessment logging and retrieval
 */

const express = require('express');
const router = express.Router();
const {
  logRiskAssessment,
  getRiskHistory,
  getCurrentRiskStatus,
  getRiskTrends,
  cleanupOldRiskLogs
} = require('../controllers/riskController');
const { authenticateUser } = require('../middleware/auth');

// All risk routes require authentication
router.use(authenticateUser);

// Log risk assessment data
router.post('/assess', logRiskAssessment);

// Get user's risk history
router.get('/history', getRiskHistory);

// Get current risk status
router.get('/status', getCurrentRiskStatus);

// Get risk trends over time
router.get('/trends', getRiskTrends);

// Admin: Cleanup old risk logs
router.delete('/cleanup', cleanupOldRiskLogs);

module.exports = router;
