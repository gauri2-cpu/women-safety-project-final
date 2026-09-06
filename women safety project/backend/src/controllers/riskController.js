/**
 * Risk Controller
 * Handles risk assessment logging and retrieval
 */

const RiskLog = require('../models/riskLogModel');

/**
 * Log risk assessment data
 */
const logRiskAssessment = async (req, res) => {
  try {
    const {
      riskLevel,
      riskScore,
      factors,
      location,
      timestamp,
      deviceInfo
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!riskLevel || riskScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Risk level and score are required'
      });
    }

    // Validate risk level
    const validLevels = ['LOW', 'MEDIUM', 'HIGH'];
    if (!validLevels.includes(riskLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid risk level. Must be LOW, MEDIUM, or HIGH'
      });
    }

    // Validate risk score
    if (riskScore < 0 || riskScore > 100) {
      return res.status(400).json({
        success: false,
        message: 'Risk score must be between 0 and 100'
      });
    }

    const riskLog = new RiskLog({
      userId,
      riskLevel,
      riskScore,
      factors: factors || {},
      location,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      deviceInfo: deviceInfo || {}
    });

    await riskLog.save();

    res.status(201).json({
      success: true,
      message: 'Risk assessment logged successfully',
      riskLog: {
        id: riskLog._id,
        riskLevel: riskLog.riskLevel,
        riskScore: riskLog.riskScore,
        timestamp: riskLog.timestamp
      }
    });

  } catch (error) {
    console.error('Error logging risk assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log risk assessment',
      error: error.message
    });
  }
};

/**
 * Get user's risk history
 */
const getRiskHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, days = 7 } = req.query;

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const riskLogs = await RiskLog.find({
      userId,
      timestamp: { $gte: startDate }
    })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit));

    // Calculate statistics
    const stats = {
      total: riskLogs.length,
      averageScore: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      latestAssessment: riskLogs[0] || null
    };

    if (riskLogs.length > 0) {
      const totalScore = riskLogs.reduce((sum, log) => sum + log.riskScore, 0);
      stats.averageScore = Math.round(totalScore / riskLogs.length);

      riskLogs.forEach(log => {
        switch (log.riskLevel) {
          case 'HIGH':
            stats.highRiskCount++;
            break;
          case 'MEDIUM':
            stats.mediumRiskCount++;
            break;
          case 'LOW':
            stats.lowRiskCount++;
            break;
        }
      });
    }

    res.json({
      success: true,
      stats,
      history: riskLogs.map(log => ({
        id: log._id,
        riskLevel: log.riskLevel,
        riskScore: log.riskScore,
        factors: log.factors,
        location: log.location,
        timestamp: log.timestamp
      }))
    });

  } catch (error) {
    console.error('Error fetching risk history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risk history',
      error: error.message
    });
  }
};

/**
 * Get current risk status
 */
const getCurrentRiskStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get the most recent risk assessment
    const latestRisk = await RiskLog.findOne({ userId })
      .sort({ timestamp: -1 })
      .limit(1);

    if (!latestRisk) {
      return res.json({
        success: true,
        currentRisk: {
          riskLevel: 'UNKNOWN',
          riskScore: 0,
          timestamp: null,
          message: 'No risk assessments available'
        }
      });
    }

    // Check if the latest assessment is recent (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isRecent = latestRisk.timestamp > oneHourAgo;

    res.json({
      success: true,
      currentRisk: {
        riskLevel: latestRisk.riskLevel,
        riskScore: latestRisk.riskScore,
        timestamp: latestRisk.timestamp,
        isRecent,
        factors: latestRisk.factors,
        location: latestRisk.location
      }
    });

  } catch (error) {
    console.error('Error fetching current risk status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current risk status',
      error: error.message
    });
  }
};

/**
 * Get risk trends over time
 */
const getRiskTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trends = await RiskLog.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId(userId),
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
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
          totalAssessments: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      success: true,
      trends: trends.map(trend => ({
        date: trend._id,
        averageScore: Math.round(trend.averageScore),
        maxScore: trend.maxScore,
        minScore: trend.minScore,
        riskDistribution: {
          high: trend.highRiskCount,
          medium: trend.mediumRiskCount,
          low: trend.lowRiskCount
        },
        totalAssessments: trend.totalAssessments
      }))
    });

  } catch (error) {
    console.error('Error fetching risk trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risk trends',
      error: error.message
    });
  }
};

/**
 * Delete old risk logs (cleanup)
 */
const cleanupOldRiskLogs = async (req, res) => {
  try {
    // Only allow admins to perform cleanup
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { daysOld = 90 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

    const result = await RiskLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} old risk log entries`
    });

  } catch (error) {
    console.error('Error cleaning up risk logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup risk logs',
      error: error.message
    });
  }
};

module.exports = {
  logRiskAssessment,
  getRiskHistory,
  getCurrentRiskStatus,
  getRiskTrends,
  cleanupOldRiskLogs
};
