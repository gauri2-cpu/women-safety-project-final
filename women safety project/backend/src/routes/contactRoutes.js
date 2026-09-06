/**
 * Contact Routes
 * Handles trusted contacts management
 */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateUser } = require('../middleware/auth');

// Add new contact (requires authentication)
router.post('/', authenticateUser, contactController.addContact);

// Get all contacts for user (requires authentication)
router.get('/', authenticateUser, contactController.getContacts);

// Update contact (requires authentication)
router.put('/:contactId', authenticateUser, contactController.updateContact);

// Delete contact (requires authentication)
router.delete('/:contactId', authenticateUser, contactController.deleteContact);

module.exports = router;
