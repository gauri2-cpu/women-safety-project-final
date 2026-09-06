/**
 * Admin Controller
 * Simple admin endpoints to list users and contacts from JSON data
 */

const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

function readJson(filename) {
  const p = path.join(DATA_DIR, filename);
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeJson(filename, data) {
  const p = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    return false;
  }
}

exports.getUsers = (req, res) => {
  const users = readJson('users.json');
  res.json({ success: true, users });
};

exports.getContacts = (req, res) => {
  const contacts = readJson('contacts.json');
  res.json({ success: true, contacts });
};

exports.getStats = (req, res) => {
  const users = readJson('users.json');
  const contacts = readJson('contacts.json');
  const alerts = readJson('alerts.json');
  const stats = {
    totalUsers: users.length,
    totalContacts: contacts.length,
    totalAlerts: alerts.length
  };
  res.json({ success: true, stats });
};

exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  if (!userId) return res.status(400).json({ success: false, message: 'Missing user id' });
  const users = readJson('users.json');
  const contacts = readJson('contacts.json');

  const remainingUsers = users.filter(u => u.id !== userId);
  const remainingContacts = contacts.filter(c => c.userId !== userId);

  const ok1 = writeJson('users.json', remainingUsers);
  const ok2 = writeJson('contacts.json', remainingContacts);

  if (!ok1 || !ok2) {
    return res.status(500).json({ success: false, message: 'Failed to delete user' });
  }

  res.json({ success: true, message: 'User deleted', userId, remainingUsersCount: remainingUsers.length });
};

exports.deleteContact = (req, res) => {
  const contactId = req.params.id;
  if (!contactId) return res.status(400).json({ success: false, message: 'Missing contact id' });
  const contacts = readJson('contacts.json');
  const remaining = contacts.filter(c => c.id !== contactId);
  const ok = writeJson('contacts.json', remaining);
  if (!ok) return res.status(500).json({ success: false, message: 'Failed to delete contact' });
  res.json({ success: true, message: 'Contact deleted', contactId, remainingCount: remaining.length });
};
