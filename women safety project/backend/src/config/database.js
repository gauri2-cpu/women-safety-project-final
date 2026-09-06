/**
 * Database Configuration
 * Handles user data and SOS alert logs storage
 * Currently using JSON file-based storage (can be replaced with MongoDB/PostgreSQL)
 */

const fs = require('fs');
const path = require('path');

// Define data directory
const DATA_DIR = path.join(__dirname, '../../data');

/**
 * Initialize data files if they don't exist
 */
function initializeDatabase() {
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Initialize users.json
    const usersFile = path.join(DATA_DIR, 'users.json');
    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
    }

    // Initialize contacts.json
    const contactsFile = path.join(DATA_DIR, 'contacts.json');
    if (!fs.existsSync(contactsFile)) {
      fs.writeFileSync(contactsFile, JSON.stringify([], null, 2));
    }

    // Initialize alerts.json
    const alertsFile = path.join(DATA_DIR, 'alerts.json');
    if (!fs.existsSync(alertsFile)) {
      fs.writeFileSync(alertsFile, JSON.stringify([], null, 2));
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

/**
 * Read data from JSON file
 * @param {string} filename - Name of the file to read
 * @returns {Array} - Data from the file
 */
function readData(filename) {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

/**
 * Write data to JSON file
 * @param {string} filename - Name of the file to write
 * @param {Array} data - Data to write
 */
function writeData(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
}

module.exports = {
  initializeDatabase,
  readData,
  writeData,
  DATA_DIR
};
