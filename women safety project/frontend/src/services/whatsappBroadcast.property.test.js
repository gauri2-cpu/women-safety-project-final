/**
 * Property-Based Tests for WhatsApp Broadcast Service
 * Using fast-check for property-based testing
 */

const fc = require('fast-check');
const {
  generateWhatsAppLink,
  formatPhoneNumber,
  isValidPhoneNumber,
  composeEmergencyMessage
} = require('./whatsappBroadcast');

describe('Feature: whatsapp-group-broadcast - Property-Based Tests', () => {
  /**
   * Property 3: Location included in message
   * **Validates: Requirements 2.4, 3.1**
   */
  describe('Property 3: Location included in message', () => {
    it('should include GPS coordinates in generated message for any valid coordinates', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -90, max: 90, noNaN: true }),  // latitude
          fc.double({ min: -180, max: 180, noNaN: true }), // longitude
          (lat, lon) => {
            const message = composeEmergencyMessage({ latitude: lat, longitude: lon });
            const expectedLink = `https://maps.google.com/?q=${lat},${lon}`;
            return message.includes(expectedLink);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 9: Distress signal in message
   * **Validates: Requirements 3.2**
   */
  describe('Property 9: Distress signal in message', () => {
    it('should contain distress signal for any location and custom message', () => {
      fc.assert(
        fc.property(
          fc.option(fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.double({ min: -180, max: 180, noNaN: true })
          }), { nil: null }),
          fc.string({ maxLength: 500 }),
          (location, customMessage) => {
            const message = composeEmergencyMessage(location, customMessage);
            return message.includes('⚠️ EMERGENCY ALERT!');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 10: Custom message appended
   * **Validates: Requirements 3.5**
   */
  describe('Property 10: Custom message appended', () => {
    it('should include custom message when provided for any non-empty custom text', () => {
      fc.assert(
        fc.property(
          fc.option(fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.double({ min: -180, max: 180, noNaN: true })
          }), { nil: null }),
          fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
          (location, customMessage) => {
            const message = composeEmergencyMessage(location, customMessage);
            return message.includes(customMessage.trim());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 11: Message formatting for WhatsApp
   * **Validates: Requirements 3.4**
   */
  describe('Property 11: Message formatting for WhatsApp', () => {
    it('should contain line breaks for proper formatting for any input', () => {
      fc.assert(
        fc.property(
          fc.option(fc.record({
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            longitude: fc.double({ min: -180, max: 180, noNaN: true })
          }), { nil: null }),
          fc.string({ maxLength: 500 }),
          (location, customMessage) => {
            const message = composeEmergencyMessage(location, customMessage);
            // Message should have multiple lines (at least 3 line breaks)
            const lineBreaks = (message.match(/\n/g) || []).length;
            return lineBreaks >= 3;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 12: Phone number E.164 formatting
   * **Validates: Requirements 5.1**
   */
  describe('Property 12: Phone number E.164 formatting', () => {
    it('should format valid phone numbers to E.164 format', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000000000, max: 9999999999 }), // 10-digit number
          (phoneNumber) => {
            const phoneStr = phoneNumber.toString();
            const formatted = formatPhoneNumber(phoneStr);
            
            // Should match E.164 pattern: + followed by digits
            const e164Pattern = /^\+[1-9]\d{1,14}$/;
            return e164Pattern.test(formatted);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should remove spaces and special characters from any phone input', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000000000, max: 9999999999 }),
          fc.constantFrom(' ', '-', '(', ')', '.'),
          (phoneNumber, separator) => {
            const phoneStr = phoneNumber.toString();
            // Insert separator at random position
            const pos = Math.floor(phoneStr.length / 2);
            const phoneWithSeparator = phoneStr.slice(0, pos) + separator + phoneStr.slice(pos);
            
            const formatted = formatPhoneNumber(phoneWithSeparator);
            
            // Formatted number should not contain separators
            return !formatted.includes(separator) && formatted.startsWith('+');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 13: URL encoding for special characters
   * **Validates: Requirements 5.2**
   */
  describe('Property 13: URL encoding for special characters', () => {
    it('should properly URL encode messages with special characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 10, maxLength: 15 }).map(s => '+91' + s.replace(/\D/g, '').slice(0, 10)),
          (message, phone) => {
            const link = generateWhatsAppLink(phone, message);
            
            // Link should be a valid URL
            try {
              new URL(link);
              return true;
            } catch {
              return false;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should encode special characters like spaces, emojis, and symbols', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Hello World', '⚠️ Alert!', 'Help @ location', 'SOS: 123'),
          fc.string({ minLength: 10, maxLength: 15 }).map(s => '+91' + s.replace(/\D/g, '').slice(0, 10)),
          (message, phone) => {
            const link = generateWhatsAppLink(phone, message);
            const urlPart = link.split('?text=')[1];
            
            // URL encoded part should not contain raw spaces or special chars
            return !urlPart.includes(' ') && !urlPart.includes('@');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 14: Valid wa.me URL format
   * **Validates: Requirements 5.3**
   */
  describe('Property 14: Valid wa.me URL format', () => {
    it('should generate URLs matching wa.me pattern for any valid input', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000000000, max: 9999999999 }).map(n => '+91' + n.toString()),
          fc.string({ minLength: 1, maxLength: 500 }),
          (phone, message) => {
            const link = generateWhatsAppLink(phone, message);
            
            // Should match pattern: https://wa.me/[phone]?text=[encoded_message]
            const pattern = /^https:\/\/wa\.me\/\d+\?text=.+$/;
            return pattern.test(link);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not include + in phone number part of URL', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000000000, max: 9999999999 }).map(n => '+91' + n.toString()),
          fc.string({ minLength: 1, maxLength: 100 }),
          (phone, message) => {
            const link = generateWhatsAppLink(phone, message);
            const phonePart = link.split('?')[0];
            
            // Phone part should not contain +
            return !phonePart.includes('+');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 16: Invalid contacts filtered
   * **Validates: Requirements 7.2**
   */
  describe('Property 16: Invalid contacts filtered', () => {
    it('should correctly identify valid phone numbers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000000000, max: 9999999999 }),
          (phoneNumber) => {
            const phoneStr = phoneNumber.toString();
            return isValidPhoneNumber(phoneStr) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid phone numbers', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string({ maxLength: 5 }), // Too short
            fc.string().filter(s => !/\d/.test(s)), // No digits
            fc.constant('') // Empty
          ),
          (invalidPhone) => {
            return isValidPhoneNumber(invalidPhone) === false;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
