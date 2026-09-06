/**
 * Evidence Model
 * MongoDB schema for evidence files (photos, videos, audio)
 */

const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['photo', 'video', 'audio'],
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  metadata: {
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number
    },
    deviceInfo: {
      userAgent: String,
      platform: String
    },
    duration: Number, // for audio/video
    resolution: String // for images
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
});

// Index for efficient queries
evidenceSchema.index({ alertId: 1, userId: 1 });
evidenceSchema.index({ userId: 1, uploadedAt: -1 });
evidenceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to get secure URL (could include token for access control)
evidenceSchema.methods.getSecureUrl = function() {
  return this.url;
};

// Static method to clean up expired evidence
evidenceSchema.statics.cleanupExpired = async function() {
  const fs = require('fs').promises;
  const expiredEvidence = await this.find({ expiresAt: { $lt: new Date() } });

  for (const evidence of expiredEvidence) {
    try {
      await fs.unlink(evidence.path);
    } catch (error) {
      console.warn(`Could not delete expired evidence file: ${evidence.path}`, error);
    }
  }

  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

module.exports = mongoose.model('Evidence', evidenceSchema);
