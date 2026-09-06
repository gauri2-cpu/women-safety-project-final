/**
 * Unit Tests for WhatsApp Broadcast Service
 */

const {
  generateWhatsAppLink,
  formatPhoneNumber,
  isValidPhoneNumber,
  composeEmergencyMessage
} = require('./whatsappBroadcast');

describe('WhatsApp Broadcast Service', () => {
  describe('generateWhatsAppLink', () => {
    it('should generate valid wa.me URL with phone and message', () => {
      const phone = '+919876543210';
      const message = 'Test emergency message';
      const link = generateWhatsAppLink(phone, message);
      
      expect(link).toBe('https://wa.me/919876543210?text=Test%20emergency%20message');
    });

    it('should URL encode special characters in message', () => {
      const phone = '+919876543210';
      const message = '⚠️ EMERGENCY! Help needed @ location';
      const link = generateWhatsAppLink(phone, message);
      
      expect(link).toContain('https://wa.me/919876543210?text=');
      expect(link).toContain('%E2%9A%A0%EF%B8%8F'); // Encoded warning emoji
      expect(link).toContain('%40'); // Encoded @
    });

    it('should remove + prefix from phone number', () => {
      const phone = '+919876543210';
      const message = 'Test';
      const link = generateWhatsAppLink(phone, message);
      
      expect(link).toContain('wa.me/919876543210');
      expect(link).not.toContain('wa.me/+91');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit Indian number with +91', () => {
      const result = formatPhoneNumber('9876543210');
      expect(result).toBe('+919876543210');
    });

    it('should format number with spaces', () => {
      const result = formatPhoneNumber('98765 43210');
      expect(result).toBe('+919876543210');
    });

    it('should format number with dashes', () => {
      const result = formatPhoneNumber('98765-43210');
      expect(result).toBe('+919876543210');
    });

    it('should format number with parentheses', () => {
      const result = formatPhoneNumber('(987) 654-3210');
      expect(result).toBe('+919876543210');
    });

    it('should preserve country code if already present', () => {
      const result = formatPhoneNumber('919876543210');
      expect(result).toBe('+919876543210');
    });

    it('should handle number with + prefix', () => {
      const result = formatPhoneNumber('+919876543210');
      expect(result).toBe('+919876543210');
    });

    it('should throw error for invalid length (too short)', () => {
      expect(() => formatPhoneNumber('12345')).toThrow('Invalid phone number length');
    });

    it('should throw error for empty string', () => {
      expect(() => formatPhoneNumber('')).toThrow('Invalid phone number length');
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should return true for valid 10-digit Indian number', () => {
      expect(isValidPhoneNumber('9876543210')).toBe(true);
    });

    it('should return true for valid number with country code', () => {
      expect(isValidPhoneNumber('+919876543210')).toBe(true);
    });

    it('should return true for valid number with spaces', () => {
      expect(isValidPhoneNumber('98765 43210')).toBe(true);
    });

    it('should return true for valid number with dashes', () => {
      expect(isValidPhoneNumber('98765-43210')).toBe(true);
    });

    it('should return false for too short number', () => {
      expect(isValidPhoneNumber('12345')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidPhoneNumber('')).toBe(false);
    });

    it('should return false for non-numeric string', () => {
      expect(isValidPhoneNumber('abcdefghij')).toBe(false);
    });

    it('should return true for international number (US)', () => {
      expect(isValidPhoneNumber('+12025551234')).toBe(true);
    });
  });

  describe('composeEmergencyMessage', () => {
    it('should include distress signal', () => {
      const message = composeEmergencyMessage(null);
      expect(message).toContain('⚠️ EMERGENCY ALERT!');
    });

    it('should include location when provided', () => {
      const location = { latitude: 28.6139, longitude: 77.2090 };
      const message = composeEmergencyMessage(location);
      
      expect(message).toContain('https://maps.google.com/?q=28.6139,77.209');
    });

    it('should include fallback text when location unavailable', () => {
      const message = composeEmergencyMessage(null);
      expect(message).toContain('Unable to determine location');
    });

    it('should include custom message when provided', () => {
      const location = { latitude: 28.6139, longitude: 77.2090 };
      const customMessage = 'Being followed, need help urgently';
      const message = composeEmergencyMessage(location, customMessage);
      
      expect(message).toContain(customMessage);
    });

    it('should use default message when custom message is empty', () => {
      const location = { latitude: 28.6139, longitude: 77.2090 };
      const message = composeEmergencyMessage(location, '');
      
      expect(message).toContain('I need help immediately!');
    });

    it('should format message with proper line breaks', () => {
      const location = { latitude: 28.6139, longitude: 77.2090 };
      const message = composeEmergencyMessage(location);
      
      // Check for line breaks
      expect(message.split('\n').length).toBeGreaterThan(3);
    });

    it('should include closing text', () => {
      const message = composeEmergencyMessage(null);
      expect(message).toContain('Please contact me or emergency services');
    });

    it('should handle location with null coordinates', () => {
      const location = { latitude: null, longitude: null };
      const message = composeEmergencyMessage(location);
      
      expect(message).toContain('Unable to determine location');
    });

    it('should trim whitespace from custom message', () => {
      const location = { latitude: 28.6139, longitude: 77.2090 };
      const customMessage = '  Help needed  ';
      const message = composeEmergencyMessage(location, customMessage);
      
      expect(message).toContain('Help needed');
      expect(message).not.toContain('  Help needed  ');
    });
  });
});
