/**
 * LocalStorage Service
 * Manages user session and data persistence
 */

const STORAGE_KEYS = {
  USER: 'womenSafety_user',
  CONTACTS: 'womenSafety_contacts',
  SESSION: 'womenSafety_session'
};

/**
 * Save user to localStorage
 */
export const saveUser = (user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

/**
 * Get user from localStorage
 */
export const getUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

/**
 * Remove user from localStorage
 */
export const removeUser = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return true;
  } catch (error) {
    console.error('Error removing user:', error);
    return false;
  }
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = () => {
  return getUser() !== null;
};

/**
 * Save contacts to localStorage
 */
export const saveContacts = (contacts) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    return true;
  } catch (error) {
    console.error('Error saving contacts:', error);
    return false;
  }
};

/**
 * Get contacts from localStorage
 */
export const getContacts = () => {
  try {
    const contacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return contacts ? JSON.parse(contacts) : [];
  } catch (error) {
    console.error('Error getting contacts:', error);
    return [];
  }
};
