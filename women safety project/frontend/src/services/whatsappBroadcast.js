/**
 * WhatsApp Broadcast Service
 * Handles WhatsApp link generation, phone number formatting, and emergency message composition
 */

/**
 * Generate WhatsApp link for single recipient
 * @param {string} phoneNumber - Phone number in international format
 * @param {string} message - Pre-formatted emergency message
 * @returns {string} - wa.me URL
 */
function generateWhatsAppLink(phoneNumber, message) {
  // Remove + from phone number for wa.me format
  const cleanPhone = phoneNumber.replace(/^\+/, '');
  
  // URL encode the message
  const encodedMessage = encodeURIComponent(message);
  
  // Generate wa.me URL
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Format phone number to international E.164 format
 * @param {string} phone - Phone number (various formats)
 * @returns {string} - E.164 format (+[country][number])
 */
function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If already has country code (more than 10 digits), add + prefix
  if (cleaned.length > 10) {
    return '+' + cleaned;
  }
  
  // If 10 digits, assume India number and add +91
  if (cleaned.length === 10) {
    return '+91' + cleaned;
  }
  
  // If less than 10 digits, invalid
  throw new Error('Invalid phone number length');
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
function isValidPhoneNumber(phone) {
  try {
    // Try to format the phone number
    const formatted = formatPhoneNumber(phone);
    
    // Check if formatted number matches E.164 pattern
    // E.164: + followed by 1-15 digits
    const e164Pattern = /^\+[1-9]\d{1,14}$/;
    return e164Pattern.test(formatted);
  } catch (error) {
    return false;
  }
}

/**
 * Compose emergency message with location
 * @param {Object} location - {latitude, longitude} or null
 * @param {string} customMessage - Optional custom message
 * @returns {string} - Formatted emergency message
 */
function composeEmergencyMessage(location, customMessage = '') {
  // Start with distress signal
  let message = '⚠️ EMERGENCY ALERT!\n\n';
  
  // Add custom message if provided
  if (customMessage && customMessage.trim()) {
    message += customMessage.trim() + '\n\n';
  } else {
    message += 'I need help immediately!\n\n';
  }
  
  // Add location information
  if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
    const mapsLink = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    message += `My location: ${mapsLink}\n\n`;
  } else {
    message += 'Location: Unable to determine location\n\n';
  }
  
  // Add closing
  message += 'Please contact me or emergency services.';
  
  return message;
}

/**
 * Track last broadcast timestamp for duplicate prevention
 */
let lastBroadcastTimestamp = 0;

/**
 * Open WhatsApp links sequentially with controlled timing
 * @param {Array<string>} phoneNumbers - List of recipient phone numbers
 * @param {string} message - Emergency message to send
 * @param {Object} callbacks - Progress callbacks
 * @param {Function} callbacks.onProgress - Called after each link (index, total)
 * @param {Function} callbacks.onComplete - Called when all links processed
 * @param {Function} callbacks.onError - Called on errors (error, index)
 * @returns {Promise<Object>} - Broadcast result {successful, failed, blocked, errors}
 */
async function broadcastToContacts(phoneNumbers, message, callbacks = {}) {
  const { onProgress, onComplete, onError } = callbacks;
  
  // Duplicate broadcast prevention - debounce within 1 second
  const now = Date.now();
  if (now - lastBroadcastTimestamp < 1000) {
    const error = new Error('Broadcast already in progress. Please wait.');
    if (onError) onError(error, -1);
    return Promise.reject(error);
  }
  lastBroadcastTimestamp = now;
  
  // Validate inputs
  if (!phoneNumbers || phoneNumbers.length === 0) {
    const error = new Error('No phone numbers provided for broadcast');
    if (onError) onError(error, -1);
    return Promise.reject(error);
  }
  
  if (!message || message.trim() === '') {
    const error = new Error('No message provided for broadcast');
    if (onError) onError(error, -1);
    return Promise.reject(error);
  }
  
  // Track results
  const results = {
    successful: 0,
    failed: 0,
    blocked: 0,
    errors: []
  };
  
  // Process each phone number sequentially
  for (let i = 0; i < phoneNumbers.length; i++) {
    const phoneNumber = phoneNumbers[i];
    
    try {
      // Format phone number
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Generate WhatsApp link
      const whatsappLink = generateWhatsAppLink(formattedPhone, message);
      
      // Attempt to open link in new window
      const newWindow = window.open(whatsappLink, '_blank');
      
      // Detect popup blocker
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup was blocked
        results.blocked++;
        results.errors.push({
          index: i,
          phoneNumber,
          error: 'Popup blocked by browser'
        });
        
        if (onError) {
          onError(new Error('Popup blocked by browser'), i);
        }
      } else {
        // Successfully opened
        results.successful++;
      }
      
    } catch (error) {
      // Error during link generation or opening
      results.failed++;
      results.errors.push({
        index: i,
        phoneNumber,
        error: error.message
      });
      
      if (onError) {
        onError(error, i);
      }
    }
    
    // Call progress callback
    if (onProgress) {
      onProgress(i + 1, phoneNumbers.length);
    }
    
    // Wait 2 seconds before opening next link (except for last one)
    if (i < phoneNumbers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Call completion callback
  if (onComplete) {
    onComplete(results);
  }
  
  return results;
}

// Export functions
module.exports = {
  generateWhatsAppLink,
  formatPhoneNumber,
  isValidPhoneNumber,
  composeEmergencyMessage,
  broadcastToContacts
};
