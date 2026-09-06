/**
 * Admin Controller (MongoDB)
 * Admin endpoints for managing users and contacts
 */

const User = require('../models/userMongoModel');
const Contact = require('../models/contactMongoModel');
const Alert = require('../models/alertMongoModel');

/**
 * Get all users
 * @route GET /api/admin/users
 */
async function getUsers(req, res) {
  try {
    const users = await User.find({});
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get all contacts
 * @route GET /api/admin/contacts
 */
async function getContacts(req, res) {
  try {
    const contacts = await Contact.find({});
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get system stats
 * @route GET /api/admin/stats
 */
async function getStats(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const totalContacts = await Contact.countDocuments();
    const totalAlerts = await Alert.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });

    const stats = {
      totalUsers,
      activeUsers,
      totalContacts,
      totalAlerts,
      avgContactsPerUser: totalUsers > 0 ? (totalContacts / totalUsers).toFixed(2) : 0
    };
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Delete user (also removes their contacts)
 * @route DELETE /api/admin/users/:id
 */
async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ success: false, message: 'Missing user id' });

    // Delete user
    const user = await User.findOneAndDelete({ id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete user's contacts
    const contactsResult = await Contact.deleteMany({ userId });

    res.json({
      success: true,
      message: 'User deleted',
      userId,
      contactsDeleted: contactsResult.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Delete contact
 * @route DELETE /api/admin/contacts/:id
 */
async function deleteContact(req, res) {
  try {
    const contactId = req.params.id;
    if (!contactId) return res.status(400).json({ success: false, message: 'Missing contact id' });

    const contact = await Contact.findOneAndDelete({ id: contactId });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.json({ success: true, message: 'Contact deleted', contactId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getUsers,
  getContacts,
  getStats,
  deleteUser,
  deleteContact
};
