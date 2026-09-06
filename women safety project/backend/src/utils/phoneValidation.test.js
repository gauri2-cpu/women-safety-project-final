/**
 * Phone Validation Utility Tests
 * Tests for phone number validation and normalization functions
 */

const {
  validatePhoneNumber,
  normalizePhoneNumber,
  filterValidContacts
} = require('./phoneValidation');

describe('Phone Validation Utility', () => {
  describe('validatePhoneNumber', () => {
    test('should validate E.164 format phone numbers', () => {
      expect(validatePhoneNumber('+919876543210')).toBe(true);
      expect(validatePhoneNumber('+14155552671')).toBe(true);
      expect(validatePhoneNumber('+442071838750')).toBe(true);
    });

    test('should validate 10-digit Indian numbers', () => {
      expect(validatePhoneNumber('9876543210')).toBe(true);
      expect(validatePhoneNumber('8765432109')).toBe(true);
      expect(validatePhoneNumber('7654321098')).toBe(true);
      expect(validatePhoneNumber('6543210987')).toBe(true);
    });

    test('should validate numbers with spaces and dashes', () => {
      expect(validatePhoneNumber('+91 98765 43210')).toBe(true);
      expect(validatePhoneNumber('+1-415-555-2671')).toBe(true);
      expect(validatePhoneNumber('987-654-3210')).toBe(true);
    });

    test('should reject invalid formats', () => {
      expect(validatePhoneNumber('')).toBe(false);
      expect(validatePhoneNumber(null)).toBe(false);
      expect(validatePhoneNumber(undefined)).toBe(false);
      expect(validatePhoneNumber('abc')).toBe(false);
      expect(validatePhoneNumber('123')).toBe(false); // Too short
      expect(validatePhoneNumber('12345')).toBe(false); // Invalid Indian number (starts with 1)
      expect(validatePhoneNumber('+1234567890123456')).toBe(false); // Too long
    });

    test('should reject numbers with only special characters', () => {
      expect(validatePhoneNumber('---')).toBe(false);
      expect(validatePhoneNumber('+++')).toBe(false);
      expect(validatePhoneNumber('()')).toBe(false);
    });
  });

  describe('normalizePhoneNumber', () => {
    test('should normalize 10-digit Indian numbers to E.164', () => {
      expect(normalizePhoneNumber('9876543210')).toBe('+919876543210');
      expect(normalizePhoneNumber('8765432109')).toBe('+918765432109');
    });

    test('should normalize numbers with spaces and dashes', () => {
      expect(normalizePhoneNumber('987-654-3210')).toBe('+919876543210');
      expect(normalizePhoneNumber('987 654 3210')).toBe('+919876543210');
      expect(normalizePhoneNumber('(987) 654-3210')).toBe('+919876543210');
    });

    test('should preserve E.164 format numbers', () => {
      expect(normalizePhoneNumber('+919876543210')).toBe('+919876543210');
      expect(normalizePhoneNumber('+14155552671')).toBe('+14155552671');
    });

    test('should normalize international numbers without + prefix', () => {
      expect(normalizePhoneNumber('14155552671')).toBe('+14155552671');
      expect(normalizePhoneNumber('442071838750')).toBe('+442071838750');
    });

    test('should use custom country code when provided', () => {
      expect(normalizePhoneNumber('9876543210', '+1')).toBe('+19876543210');
      expect(normalizePhoneNumber('9876543210', '+44')).toBe('+449876543210');
    });

    test('should throw error for invalid inputs', () => {
      expect(() => normalizePhoneNumber('')).toThrow('Invalid phone number');
      expect(() => normalizePhoneNumber(null)).toThrow('Invalid phone number');
      expect(() => normalizePhoneNumber(undefined)).toThrow('Invalid phone number');
      expect(() => normalizePhoneNumber('abc')).toThrow('Invalid phone number length');
      expect(() => normalizePhoneNumber('123')).toThrow('Invalid phone number length');
      expect(() => normalizePhoneNumber('12345678901234567')).toThrow('Invalid phone number length');
    });
  });

  describe('filterValidContacts', () => {
    test('should filter out contacts with invalid phone numbers', () => {
      const contacts = [
        { id: '1', name: 'Valid 1', phone: '+919876543210' },
        { id: '2', name: 'Valid 2', phone: '9876543210' },
        { id: '3', name: 'Invalid', phone: 'abc' },
        { id: '4', name: 'Invalid', phone: '123' },
        { id: '5', name: 'Valid 3', phone: '+14155552671' }
      ];

      const filtered = filterValidContacts(contacts);
      expect(filtered).toHaveLength(3);
      expect(filtered.map(c => c.id)).toEqual(['1', '2', '5']);
    });

    test('should handle empty array', () => {
      expect(filterValidContacts([])).toEqual([]);
    });

    test('should handle null and undefined', () => {
      expect(filterValidContacts(null)).toEqual([]);
      expect(filterValidContacts(undefined)).toEqual([]);
    });

    test('should filter out contacts without phone property', () => {
      const contacts = [
        { id: '1', name: 'Valid', phone: '+919876543210' },
        { id: '2', name: 'No Phone' },
        { id: '3', name: 'Null Phone', phone: null }
      ];

      const filtered = filterValidContacts(contacts);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    test('should filter out invalid contact objects', () => {
      const contacts = [
        { id: '1', name: 'Valid', phone: '+919876543210' },
        null,
        undefined,
        'not an object',
        { id: '2', name: 'Valid 2', phone: '9876543210' }
      ];

      const filtered = filterValidContacts(contacts);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.id)).toEqual(['1', '2']);
    });
  });
});
