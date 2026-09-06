/**
 * Contact Controller (MongoDB)
 * Handles trusted contacts management
 */

const Contact = require('../models/contactMongoModel');
const User = require('../models/userMongoModel');

/**
 * Add trusted contact
 * @route POST /api/contacts
 */
async function addContact(req, res) {
  try {
    const userId = req.userId;
    const { name, phone, email } = req.body;

    if (!userId || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'User ID, name, and phone are required'
      });
    }

    // Verify user exists
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create contact
    const contact = new Contact({
      userId,
      name,
      phone,
      email
    });

    await contact.save();

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
async function getContacts(req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const contacts = await Contact.find({ userId });

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
 * Update contact
 * @route PUT /api/contacts/:contactId
 */
async function updateContact(req, res) {
  try {
    const userId = req.userId;
    const contactId = req.params.contactId;
    const { name, phone, email } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verify contact belongs to user
    const contact = await Contact.findOneAndUpdate(
      { id: contactId, userId },
      { name, phone, email, updatedAt: new Date() },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found or does not belong to user'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      contact: contact
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
 * Delete contact
 * @route DELETE /api/contacts/:contactId
 */
async function deleteContact(req, res) {
  try {
    const userId = req.userId;
    const contactId = req.params.contactId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const contact = await Contact.findOneAndDelete({
      id: contactId,
      userId
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found or does not belong to user'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
      contactId: contact.id
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
