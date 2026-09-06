/**
 * Alert Model
 * Handles SOS alert logs and operations
 */

const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../config/database');

/**
 * Log an SOS alert
 * @param {string} userId - User ID
 * @param {object} alertData - Alert data (latitude, longitude, message, whatsappBroadcast, smsFallback)
 * @returns {object} - Created alert
 */
function logAlert(userId, alertData) {
  const alerts = readData('alerts');
  
  const newAlert = {
    id: uuidv4(),
    userId: userId,
    latitude: alertData.latitude,
    longitude: alertData.longitude,
    message: alertData.message || 'Emergency SOS Alert',
    contactsNotified: alertData.contactsNotified || [],
    status: 'active', // active, resolved, cancelled
    timestamp: new Date().toISOString()
  };

  // Add WhatsApp broadcast tracking if provided
  if (alertData.whatsappBroadcast) {
    newAlert.whatsappBroadcast = {
      attempted: alertData.whatsappBroadcast.attempted || false,
      contactsAttempted: alertData.whatsappBroadcast.contactsAttempted || 0,
      contactsSuccessful: alertData.whatsappBroadcast.contactsSuccessful || 0,
      errors: alertData.whatsappBroadcast.errors || [],
      timestamp: alertData.whatsappBroadcast.timestamp || new Date().toISOString()
    };
  }

  // Add SMS fallback tracking if provided
  if (alertData.smsFallback) {
    newAlert.smsFallback = {
      triggered: alertData.smsFallback.triggered || false,
      contactsNotified: alertData.smsFallback.contactsNotified || 0,
      timestamp: alertData.smsFallback.timestamp || new Date().toISOString()
    };
  }

  alerts.push(newAlert);
  writeData('alerts', alerts);
  
  return newAlert;
}

/**
 * Get all alerts for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of recent alerts to fetch
 * @returns {Array} - List of alerts
 */
function getUserAlerts(userId, limit = 50) {
  const alerts = readData('alerts');
  return alerts
    .filter(a => a.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

/**
 * Get alert by ID
 * @param {string} alertId - Alert ID
 * @returns {object} - Alert data
 */
function getAlertById(alertId) {
  const alerts = readData('alerts');
  return alerts.find(a => a.id === alertId);
}

/**
 * Update alert status (resolve, cancel, etc.)
 * @param {string} alertId - Alert ID
 * @param {string} status - New status
 * @returns {object} - Updated alert
 */
function updateAlertStatus(alertId, status) {
  const alerts = readData('alerts');
  const alertIndex = alerts.findIndex(a => a.id === alertId);
  
  if (alertIndex === -1) {
    throw new Error('Alert not found');
  }

  alerts[alertIndex] = { 
    ...alerts[alertIndex], 
    status: status,
    updatedAt: new Date().toISOString()
  };
  writeData('alerts', alerts);
  
  return alerts[alertIndex];
}

/**
 * Update contacted list for an alert
 * @param {string} alertId - Alert ID
 * @param {Array} contactIds - List of contact IDs notified
 * @returns {object} - Updated alert
 */
function updateContactsNotified(alertId, contactIds) {
  const alerts = readData('alerts');
  const alertIndex = alerts.findIndex(a => a.id === alertId);
  
  if (alertIndex === -1) {
    throw new Error('Alert not found');
  }

  alerts[alertIndex].contactsNotified = contactIds;
  writeData('alerts', alerts);
  
  return alerts[alertIndex];
}

/**
 * Update WhatsApp broadcast details for an alert
 * @param {string} alertId - Alert ID
 * @param {object} broadcastData - Broadcast data (attempted, contactsAttempted, contactsSuccessful, errors)
 * @returns {object} - Updated alert
 */
function updateWhatsAppBroadcast(alertId, broadcastData) {
  const alerts = readData('alerts');
  const alertIndex = alerts.findIndex(a => a.id === alertId);
  
  if (alertIndex === -1) {
    throw new Error('Alert not found');
  }

  alerts[alertIndex].whatsappBroadcast = {
    attempted: broadcastData.attempted !== undefined ? broadcastData.attempted : true,
    contactsAttempted: broadcastData.contactsAttempted || 0,
    contactsSuccessful: broadcastData.contactsSuccessful || 0,
    errors: broadcastData.errors || [],
    timestamp: broadcastData.timestamp || new Date().toISOString()
  };
  
  alerts[alertIndex].updatedAt = new Date().toISOString();
  writeData('alerts', alerts);
  
  return alerts[alertIndex];
}

/**
 * Update SMS fallback details for an alert
 * @param {string} alertId - Alert ID
 * @param {object} smsData - SMS fallback data (triggered, contactsNotified)
 * @returns {object} - Updated alert
 */
function updateSmsFallback(alertId, smsData) {
  const alerts = readData('alerts');
  const alertIndex = alerts.findIndex(a => a.id === alertId);
  
  if (alertIndex === -1) {
    throw new Error('Alert not found');
  }

  alerts[alertIndex].smsFallback = {
    triggered: smsData.triggered !== undefined ? smsData.triggered : true,
    contactsNotified: smsData.contactsNotified || 0,
    timestamp: smsData.timestamp || new Date().toISOString()
  };
  
  alerts[alertIndex].updatedAt = new Date().toISOString();
  writeData('alerts', alerts);
  
  return alerts[alertIndex];
}

/**
 * Update alert with broadcast details (combined update)
 * @param {string} alertId - Alert ID
 * @param {object} updateData - Update data (whatsappBroadcast, smsFallback, status)
 * @returns {object} - Updated alert
 */
function updateAlert(alertId, updateData) {
  const alerts = readData('alerts');
  const alertIndex = alerts.findIndex(a => a.id === alertId);
  
  if (alertIndex === -1) {
    throw new Error('Alert not found');
  }

  // Update WhatsApp broadcast if provided
  if (updateData.whatsappBroadcast) {
    alerts[alertIndex].whatsappBroadcast = {
      attempted: updateData.whatsappBroadcast.attempted !== undefined ? updateData.whatsappBroadcast.attempted : true,
      contactsAttempted: updateData.whatsappBroadcast.contactsAttempted || 0,
      contactsSuccessful: updateData.whatsappBroadcast.contactsSuccessful || 0,
      errors: updateData.whatsappBroadcast.errors || [],
      timestamp: updateData.whatsappBroadcast.timestamp || new Date().toISOString()
    };
  }

  // Update SMS fallback if provided
  if (updateData.smsFallback) {
    alerts[alertIndex].smsFallback = {
      triggered: updateData.smsFallback.triggered !== undefined ? updateData.smsFallback.triggered : true,
      contactsNotified: updateData.smsFallback.contactsNotified || 0,
      timestamp: updateData.smsFallback.timestamp || new Date().toISOString()
    };
  }

  // Update status if provided
  if (updateData.status) {
    alerts[alertIndex].status = updateData.status;
  }

  alerts[alertIndex].updatedAt = new Date().toISOString();
  writeData('alerts', alerts);
  
  return alerts[alertIndex];
}

module.exports = {
  logAlert,
  getUserAlerts,
  getAlertById,
  updateAlertStatus,
  updateContactsNotified,
  updateWhatsAppBroadcast,
  updateSmsFallback,
  updateAlert
};
