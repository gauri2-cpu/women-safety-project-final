/**
 * SOS Alert Routes
 * Handles emergency SOS alerts and notifications
 */

const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const { authenticateUser, allowGuestUser } = require('../middleware/auth');

// Trigger SOS alert (requires user ID, can be guest)
router.post('/trigger', allowGuestUser, sosController.triggerSOS);

// Prepare WhatsApp broadcast (requires user ID, can be guest)
router.post('/prepare-whatsapp-broadcast', allowGuestUser, sosController.prepareWhatsAppBroadcast);

// Log WhatsApp broadcast attempt (requires user ID, can be guest)
router.post('/log-whatsapp-broadcast', allowGuestUser, sosController.logWhatsAppBroadcast);

// Get SOS alert history (requires authentication)
router.get('/alerts', authenticateUser, sosController.getAlerts);

// Get specific alert details (requires authentication)
router.get('/alerts/:alertId', authenticateUser, sosController.getAlertDetails);

// Resolve/Cancel alert (requires authentication)
router.put('/alerts/:alertId/resolve', authenticateUser, sosController.resolveAlert);

module.exports = router;
