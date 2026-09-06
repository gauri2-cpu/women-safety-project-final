/**
 * Phone Number Validation Utility
 * Handles phone number validation and normalization for WhatsApp integration
 * Supports E.164 international format with +91 default for India
 */

/**
 * Validate phone number format
 * Checks if phone number matches valid international format patterns
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove all whitespace and special characters except +
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // E.164 format: + followed by 1-15 digits
  // Must start with + and country code (1-3 digits), followed by 7-15 digits
  const e164Regex = /^\+[1-9]\d{7,14}$/;

  // If already in E.164 format, validate directly
  if (cleaned.startsWith('+')) {
    return e164Regex.test(cleaned);
  }

  // If no country code, check if it's a valid 10-digit Indian number
  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    // Valid 10-digit number (will be normalized to +91)
    return /^[6-9]\d{9}$/.test(digitsOnly); // Indian mobile numbers start with 6-9
  }

  // Check if it's a valid international number without + prefix (11-15 digits)
  if (digitsOnly.length >= 11 && digitsOnly.length <= 15) {
    return /^[1-9]\d{10,14}$/.test(digitsOnly);
  }

  return false;
}

/**
 * Normalize phone number to E.164 format
 * Converts various phone number formats to standard E.164 format
 * 
 * @param {string} phone - Phone number in various formats
 * @param {string} defaultCountryCode - Default country code (default: '+91' for India)
 * @returns {string} - Normalized phone number in E.164 format (+[country][number])
 * @throws {Error} - If phone number is invalid or cannot be normalized
 */
function normalizePhoneNumber(phone, defaultCountryCode = '+91') {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Invalid phone number: must be a non-empty string');
  }

  // Remove all whitespace and special characters except +
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // If already starts with +, validate and return
  if (cleaned.startsWith('+')) {
    const digitsOnly = cleaned.substring(1).replace(/\D/g, '');
    if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
      return '+' + digitsOnly;
    }
    throw new Error('Invalid phone number: incorrect length for international format');
  }

  // Remove any remaining non-digit characters
  const digitsOnly = cleaned.replace(/\D/g, '');

  // If 10 digits, assume it's an Indian number
  if (digitsOnly.length === 10) {
    return defaultCountryCode + digitsOnly;
  }

  // If 11-15 digits, assume it already includes country code
  if (digitsOnly.length >= 11 && digitsOnly.length <= 15) {
    return '+' + digitsOnly;
  }

  // Invalid length
  throw new Error(`Invalid phone number length: ${digitsOnly.length} digits (expected 10-15)`);
}

/**
 * Filter valid contacts from a contact list
 * Removes contacts with invalid phone numbers
 * 
 * @param {Array<Object>} contacts - Array of contact objects with phone property
 * @returns {Array<Object>} - Array of contacts with valid phone numbers only
 */
function filterValidContacts(contacts) {
  if (!Array.isArray(contacts)) {
    return [];
  }

  return contacts.filter(contact => {
    if (!contact || typeof contact !== 'object') {
      return false;
    }

    if (!contact.phone) {
      return false;
    }

    return validatePhoneNumber(contact.phone);
  });
}

module.exports = {
  validatePhoneNumber,
  normalizePhoneNumber,
  filterValidContacts
};
