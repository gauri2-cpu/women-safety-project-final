/**
 * Evidence Routes
 * Routes for evidence upload, retrieval, and management
 */

const express = require('express');
const router = express.Router();
const {
  upload,
  uploadEvidence,
  getEvidenceByAlert,
  downloadEvidence,
  deleteEvidence,
  getEvidenceStats
} = require('../controllers/evidenceController');
const { authenticateUser } = require('../middleware/auth');

// All evidence routes require authentication
router.use(authenticateUser);

// Upload evidence files (supports multiple files)
router.post('/upload', upload.array('evidence', 5), uploadEvidence);

// Get evidence for a specific alert
router.get('/alert/:alertId', getEvidenceByAlert);

// Download evidence file
router.get('/download/:filename', downloadEvidence);

// Delete evidence
router.delete('/:evidenceId', deleteEvidence);

// Get user's evidence statistics
router.get('/stats', getEvidenceStats);

module.exports = router;
