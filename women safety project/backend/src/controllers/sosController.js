/**
 * SOS Alert Controller
 * Handles emergency SOS alerts and notifications
 */

const alertModel = require('../models/alertModel');
const contactModel = require('../models/contactModel');
const { sendSMS, sendWhatsApp } = require('../config/twilio');
const { filterValidContacts, normalizePhoneNumber } = require('../utils/phoneValidation');

/**
 * Trigger SOS alert and notify contacts
 * @route POST /api/sos/trigger
 */
async function triggerSOS(req, res) {
  try {
    const userId = req.userId;
    const { latitude, longitude, message, notificationMethod } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Location (latitude and longitude) is required'
      });
    }

    // Create alert log
    const alert = alertModel.logAlert(userId, {
      latitude,
      longitude,
      message: message || 'Emergency SOS Alert',
      contactsNotified: [],
      status: 'active'
    });

    // Get user's trusted contacts
    const contacts = contactModel.getUserContacts(userId);

    if (contacts.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'SOS alert triggered but no trusted contacts to notify',
        alert: alert,
        contactsNotified: []
      });
    }

    // Generate Google Maps link
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

    // Prepare message
    const sosMessage = `⚠️ EMERGENCY ALERT!\n\n${message || 'I need help immediately!'}\n\nLocation: ${mapsLink}\n\nPlease contact me or emergency services.`;

    // Notify contacts based on method
    const notificationPromises = [];
    const contactIds = [];

    for (const contact of contacts) {
      contactIds.push(contact.id);

      if (notificationMethod === 'sms' || notificationMethod === 'both') {
        notificationPromises.push(
          sendSMS(contact.phone, sosMessage).catch(err => {
            console.error(`Failed to send SMS to ${contact.phone}:`, err);
          })
        );
      }

      if (notificationMethod === 'whatsapp' || notificationMethod === 'both') {
        notificationPromises.push(
          sendWhatsApp(contact.phone, sosMessage).catch(err => {
            console.error(`Failed to send WhatsApp to ${contact.phone}:`, err);
          })
        );
      }
    }

    // Execute all notifications
    await Promise.all(notificationPromises);

    // Update alert with contacted list
    const updatedAlert = alertModel.updateContactsNotified(alert.id, contactIds);

    return res.status(200).json({
      success: true,
      message: 'SOS alert triggered and notifications sent',
      alert: updatedAlert,
      contactsNotified: contacts.length,
      mapsLink: mapsLink
    });
  } catch (error) {
    console.error('Error triggering SOS:', error);
    return res.status(500).json({
      success: false,
      message: 'Error triggering SOS alert',
      error: error.message
    });
  }
}

/**
 * Get SOS alert history
 * @route GET /api/sos/alerts
 */
function getAlerts(req, res) {
  try {
    const userId = req.userId;
    const { limit } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const alerts = alertModel.getUserAlerts(userId, limit ? parseInt(limit) : 50);

    return res.status(200).json({
      success: true,
      count: alerts.length,
      alerts: alerts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
}

/**
 * Get specific alert details
 * @route GET /api/sos/alerts/:alertId
 */
function getAlertDetails(req, res) {
  try {
    const userId = req.userId;
    const { alertId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const alert = alertModel.getAlertById(alertId);

    if (!alert || alert.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this alert'
      });
    }

    return res.status(200).json({
      success: true,
      alert: alert
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching alert details',
      error: error.message
    });
  }
}

/**
 * Resolve/Cancel an alert
 * @route PUT /api/sos/alerts/:alertId/resolve
 */
function resolveAlert(req, res) {
  try {
    const userId = req.userId;
    const { alertId } = req.params;
    const { status } = req.body; // 'resolved' or 'cancelled'

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const alert = alertModel.getAlertById(alertId);

    if (!alert || alert.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this alert'
      });
    }

    const validStatuses = ['resolved', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be resolved or cancelled'
      });
    }

    const updatedAlert = alertModel.updateAlertStatus(alertId, status);

    return res.status(200).json({
      success: true,
      message: `Alert ${status} successfully`,
      alert: updatedAlert
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating alert',
      error: error.message
    });
  }
}

/**
 * Prepare WhatsApp broadcast
 * Validates contacts, creates alert record, returns data needed for frontend broadcast
 * @route POST /api/sos/prepare-whatsapp-broadcast
 */
async function prepareWhatsAppBroadcast(req, res) {
  try {
    const userId = req.userId;
    const { latitude, longitude, message } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Location (latitude and longitude) is required'
      });
    }

    // Get user's trusted contacts
    const contacts = contactModel.getUserContacts(userId);

    if (contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No trusted contacts found. Please add contacts before using emergency broadcast.'
      });
    }

    // Filter valid contacts
    const validContacts = filterValidContacts(contacts);
    const invalidContactCount = contacts.length - validContacts.length;

    if (validContacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid contacts found. All contacts have invalid phone numbers.'
      });
    }

    // Log warnings for invalid contacts
    if (invalidContactCount > 0) {
      console.warn(`User ${userId}: ${invalidContactCount} contacts skipped due to invalid phone numbers`);
    }

    // Generate Google Maps link
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

    // Compose emergency message
    const customMessage = message || 'I need help immediately!';
    const formattedMessage = `⚠️ EMERGENCY ALERT!\n\n${customMessage}\n\nLocation: ${mapsLink}\n\nPlease contact me or emergency services.`;

    // Create alert record
    const alert = alertModel.logAlert(userId, {
      latitude,
      longitude,
      message: customMessage,
      contactsNotified: [],
      status: 'active'
    });

    // Normalize phone numbers for WhatsApp
    const contactsWithNormalizedPhones = validContacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      phone: normalizePhoneNumber(contact.phone)
    }));

    return res.status(200).json({
      success: true,
      alertId: alert.id,
      contacts: contactsWithNormalizedPhones,
      formattedMessage: formattedMessage,
      validContactCount: validContacts.length,
      invalidContactCount: invalidContactCount
    });
  } catch (error) {
    console.error('Error preparing WhatsApp broadcast:', error);
    return res.status(500).json({
      success: false,
      message: 'Error preparing WhatsApp broadcast',
      error: error.message
    });
  }
}

/**
 * Log WhatsApp broadcast attempt
 * Updates alert record with broadcast results after completion
 * @route POST /api/sos/log-whatsapp-broadcast
 */
async function logWhatsAppBroadcast(req, res) {
  try {
    const userId = req.userId;
    const { alertId, contactsAttempted, contactsSuccessful, errors } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!alertId) {
      return res.status(400).json({
        success: false,
        message: 'Alert ID is required'
      });
    }

    if (contactsAttempted === undefined || contactsSuccessful === undefined) {
      return res.status(400).json({
        success: false,
        message: 'contactsAttempted and contactsSuccessful are required'
      });
    }

    // Get alert and verify ownership
    const alert = alertModel.getAlertById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    if (alert.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this alert'
      });
    }

    // Update alert with broadcast details
    const alerts = require('../config/database').readData('alerts');
    const alertIndex = alerts.findIndex(a => a.id === alertId);

    if (alertIndex !== -1) {
      alerts[alertIndex] = {
        ...alerts[alertIndex],
        whatsappBroadcast: {
          attempted: true,
          contactsAttempted: contactsAttempted,
          contactsSuccessful: contactsSuccessful,
          errors: errors || [],
          timestamp: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };

      require('../config/database').writeData('alerts', alerts);
    }

    return res.status(200).json({
      success: true,
      message: 'WhatsApp broadcast logged successfully',
      alert: alerts[alertIndex]
    });
  } catch (error) {
    console.error('Error logging WhatsApp broadcast:', error);
    return res.status(500).json({
      success: false,
      message: 'Error logging WhatsApp broadcast',
      error: error.message
    });
  }
}

module.exports = {
  triggerSOS,
  getAlerts,
  getAlertDetails,
  resolveAlert,
  prepareWhatsAppBroadcast,
  logWhatsAppBroadcast
};
