/**
 * Evidence Controller
 * Handles evidence upload, retrieval, and management
 */

const Evidence = require('../models/evidenceModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/evidence');

    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `evidence-${uniqueSuffix}${extension}`);
  }
});

// File filter for evidence types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'audio/wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/webm',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only audio, image, and video files are allowed.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Maximum 5 files per upload
  }
});

/**
 * Upload evidence files
 */
const uploadEvidence = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { alertId } = req.body;
    const userId = req.user.id;

    if (!alertId) {
      return res.status(400).json({
        success: false,
        message: 'Alert ID is required'
      });
    }

    const evidenceRecords = [];

    for (const file of req.files) {
      const evidenceData = {
        alertId,
        userId,
        type: getEvidenceType(file.mimetype),
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/api/evidence/download/${file.filename}`,
        metadata: {
          location: req.body.location ? JSON.parse(req.body.location) : null,
          deviceInfo: {
            userAgent: req.headers['user-agent'],
            platform: req.body.platform || 'unknown'
          }
        }
      };

      // Add type-specific metadata
      if (file.mimetype.startsWith('audio/')) {
        evidenceData.metadata.duration = req.body.duration ? parseFloat(req.body.duration) : null;
      } else if (file.mimetype.startsWith('image/')) {
        evidenceData.metadata.resolution = req.body.resolution || null;
      }

      const evidence = new Evidence(evidenceData);
      await evidence.save();
      evidenceRecords.push(evidence);
    }

    res.status(201).json({
      success: true,
      message: `${evidenceRecords.length} evidence file(s) uploaded successfully`,
      evidence: evidenceRecords.map(ev => ({
        id: ev._id,
        type: ev.type,
        url: ev.url,
        uploadedAt: ev.uploadedAt
      }))
    });

  } catch (error) {
    console.error('Error uploading evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload evidence',
      error: error.message
    });
  }
};

/**
 * Get evidence for a specific alert
 */
const getEvidenceByAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.id;

    const evidence = await Evidence.find({
      alertId,
      userId,
      expiresAt: { $gt: new Date() }
    }).sort({ uploadedAt: -1 });

    res.json({
      success: true,
      evidence: evidence.map(ev => ({
        id: ev._id,
        type: ev.type,
        url: ev.getSecureUrl(),
        filename: ev.originalName,
        size: ev.size,
        uploadedAt: ev.uploadedAt,
        metadata: ev.metadata
      }))
    });

  } catch (error) {
    console.error('Error fetching evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evidence',
      error: error.message
    });
  }
};

/**
 * Download evidence file
 */
const downloadEvidence = async (req, res) => {
  try {
    const { filename } = req.params;

    const evidence = await Evidence.findOne({
      filename,
      expiresAt: { $gt: new Date() }
    });

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence not found or expired'
      });
    }

    // Check if user owns this evidence or is admin
    if (evidence.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if file exists
    try {
      await fs.access(evidence.path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Evidence file not found on server'
      });
    }

    res.setHeader('Content-Type', evidence.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${evidence.originalName}"`);

    const fileStream = require('fs').createReadStream(evidence.path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download evidence',
      error: error.message
    });
  }
};

/**
 * Delete evidence
 */
const deleteEvidence = async (req, res) => {
  try {
    const { evidenceId } = req.params;
    const userId = req.user.id;

    const evidence = await Evidence.findOne({
      _id: evidenceId,
      userId
    });

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence not found'
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(evidence.path);
    } catch (fileError) {
      console.warn('Could not delete evidence file:', fileError);
    }

    // Delete database record
    await Evidence.findByIdAndDelete(evidenceId);

    res.json({
      success: true,
      message: 'Evidence deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete evidence',
      error: error.message
    });
  }
};

/**
 * Get user's evidence statistics
 */
const getEvidenceStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Evidence.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' },
          lastUploaded: { $max: '$uploadedAt' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalSize: stat.totalSize,
          lastUploaded: stat.lastUploaded
        };
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Error fetching evidence stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evidence statistics',
      error: error.message
    });
  }
};

/**
 * Helper function to determine evidence type from MIME type
 */
const getEvidenceType = (mimeType) => {
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('image/')) return 'photo';
  if (mimeType.startsWith('video/')) return 'video';
  return 'unknown';
};

module.exports = {
  upload,
  uploadEvidence,
  getEvidenceByAlert,
  downloadEvidence,
  deleteEvidence,
  getEvidenceStats
};
