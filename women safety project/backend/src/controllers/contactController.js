/**
 * Contact Controller
 * Handles trusted contacts operations
 */

const contactModel = require('../models/contactModel');

/**
 * Add a new trusted contact
 * @route POST /api/contacts
 */
function addContact(req, res) {
  try {
    const userId = req.userId;
    const { name, phone } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
    }

    // Validate phone format - allow various formats including international
    // Accept: +919876543210, 9876543210, +1-234-567-8900, etc.
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    const phoneRegex = /^[\+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please enter 10-15 digits with optional country code.'
      });
    }

    const contact = contactModel.addContact(userId, { name, phone });

    return res.status(201).json({
      success: true,
      message: 'Contact added successfully',
      contact: contact
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error adding contact',
      error: error.message
    });
  }
}

/**
 * Get all contacts for a user
 * @route GET /api/contacts
 */
function getContacts(req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const contacts = contactModel.getUserContacts(userId);

    return res.status(200).json({
      success: true,
      count: contacts.length,
      contacts: contacts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message
    });
  }
}

/**
 * Update a contact
 * @route PUT /api/contacts/:contactId
 */
function updateContact(req, res) {
  try {
    const userId = req.userId;
    const { contactId } = req.params;
    const { name, phone } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verify contact belongs to user
    const contact = contactModel.getContactById(contactId);
    if (!contact || contact.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this contact'
      });
    }

    const updatedContact = contactModel.updateContact(contactId, { name, phone });

    return res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      contact: updatedContact
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating contact',
      error: error.message
    });
  }
}

/**
 * Delete a contact
 * @route DELETE /api/contacts/:contactId
 */
function deleteContact(req, res) {
  try {
    const userId = req.userId;
    const { contactId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verify contact belongs to user
    const contact = contactModel.getContactById(contactId);
    if (!contact || contact.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this contact'
      });
    }

    contactModel.deleteContact(contactId);

    return res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting contact',
      error: error.message
    });
  }
}

module.exports = {
  addContact,
  getContacts,
  updateContact,
  deleteContact
};
