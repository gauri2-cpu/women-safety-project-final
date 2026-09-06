/**
 * Risk Log Model
 * MongoDB schema for risk assessment logs
 */

const mongoose = require('mongoose');

const riskLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    required: true
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  factors: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    address: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  deviceInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  }
});

// Index for efficient queries
riskLogSchema.index({ userId: 1, timestamp: -1 });
riskLogSchema.index({ userId: 1, riskLevel: 1 });
riskLogSchema.index({ timestamp: 1 });
riskLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to get risk statistics for a user
riskLogSchema.statics.getUserRiskStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalAssessments: { $sum: 1 },
        averageScore: { $avg: '$riskScore' },
        maxScore: { $max: '$riskScore' },
        minScore: { $min: '$riskScore' },
        highRiskCount: {
          $sum: { $cond: [{ $eq: ['$riskLevel', 'HIGH'] }, 1, 0] }
        },
        mediumRiskCount: {
          $sum: { $cond: [{ $eq: ['$riskLevel', 'MEDIUM'] }, 1, 0] }
        },
        lowRiskCount: {
          $sum: { $cond: [{ $eq: ['$riskLevel', 'LOW'] }, 1, 0] }
        },
        latestAssessment: { $max: '$timestamp' }
      }
    }
  ]);

  return stats[0] || {
    totalAssessments: 0,
    averageScore: 0,
    maxScore: 0,
    minScore: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0,
    latestAssessment: null
  };
};

// Static method to clean up old risk logs
riskLogSchema.statics.cleanupOldLogs = async function(daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('RiskLog', riskLogSchema);
