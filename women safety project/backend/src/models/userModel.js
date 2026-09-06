/**
 * User Model
 * Handles user data structure and operations
 */

const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../config/database');

/**
 * Create a new user
 * @param {object} userData - User data (email, name, phone)
 * @returns {object} - Created user
 */
function createUser(userData) {
  const users = readData('users');
  
  // Check if user already exists
  if (users.some(u => u.email === userData.email)) {
    throw new Error('User already exists');
  }

  const newUser = {
    id: uuidv4(),
    email: userData.email,
    name: userData.name,
    phone: userData.phone,
    createdAt: new Date().toISOString(),
    isGuest: userData.isGuest || false
  };

  users.push(newUser);
  writeData('users', users);
  
  return newUser;
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {object} - User data
 */
function getUserByEmail(email) {
  const users = readData('users');
  return users.find(u => u.email === email);
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {object} - User data
 */
function getUserById(userId) {
  const users = readData('users');
  return users.find(u => u.id === userId);
}

/**
 * Update user data
 * @param {string} userId - User ID
 * @param {object} updateData - Data to update
 * @returns {object} - Updated user
 */
function updateUser(userId, updateData) {
  const users = readData('users');
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex] = { ...users[userIndex], ...updateData, updatedAt: new Date().toISOString() };
  writeData('users', users);
  
  return users[userIndex];
}

/**
 * Delete user
 * @param {string} userId - User ID
 */
function deleteUser(userId) {
  const users = readData('users');
  const filteredUsers = users.filter(u => u.id !== userId);
  writeData('users', filteredUsers);
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser
};
