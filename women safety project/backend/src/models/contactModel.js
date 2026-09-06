/**
 * Contact Model
 * Handles trusted contacts data structure and operations
 */

const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../config/database');

/**
 * Add a new trusted contact
 * @param {string} userId - User ID
 * @param {object} contactData - Contact data (name, phone)
 * @returns {object} - Created contact
 */
function addContact(userId, contactData) {
  const contacts = readData('contacts');
  
  const newContact = {
    id: uuidv4(),
    userId: userId,
    name: contactData.name,
    phone: contactData.phone,
    createdAt: new Date().toISOString()
  };

  contacts.push(newContact);
  writeData('contacts', contacts);
  
  return newContact;
}

/**
 * Get all contacts for a user
 * @param {string} userId - User ID
 * @returns {Array} - List of contacts
 */
function getUserContacts(userId) {
  const contacts = readData('contacts');
  return contacts.filter(c => c.userId === userId);
}

/**
 * Get contact by ID
 * @param {string} contactId - Contact ID
 * @returns {object} - Contact data
 */
function getContactById(contactId) {
  const contacts = readData('contacts');
  return contacts.find(c => c.id === contactId);
}

/**
 * Update contact
 * @param {string} contactId - Contact ID
 * @param {object} updateData - Data to update
 * @returns {object} - Updated contact
 */
function updateContact(contactId, updateData) {
  const contacts = readData('contacts');
  const contactIndex = contacts.findIndex(c => c.id === contactId);
  
  if (contactIndex === -1) {
    throw new Error('Contact not found');
  }

  contacts[contactIndex] = { 
    ...contacts[contactIndex], 
    ...updateData, 
    updatedAt: new Date().toISOString() 
  };
  writeData('contacts', contacts);
  
  return contacts[contactIndex];
}

/**
 * Delete contact
 * @param {string} contactId - Contact ID
 */
function deleteContact(contactId) {
  const contacts = readData('contacts');
  const filteredContacts = contacts.filter(c => c.id !== contactId);
  writeData('contacts', filteredContacts);
}

module.exports = {
  addContact,
  getUserContacts,
  getContactById,
  updateContact,
  deleteContact
};
