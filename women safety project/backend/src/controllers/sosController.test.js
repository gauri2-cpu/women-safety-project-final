/**
 * SOS Controller Tests
 * Tests for WhatsApp broadcast endpoints
 */

const sosController = require('./sosController');
const alertModel = require('../models/alertModel');
const contactModel = require('../models/contactModel');
const { filterValidContacts, normalizePhoneNumber } = require('../utils/phoneValidation');

// Mock dependencies
jest.mock('../models/alertModel');
jest.mock('../models/contactModel');
jest.mock('../utils/phoneValidation');
jest.mock('../config/twilio', () => ({
  sendSMS: jest.fn(),
  sendWhatsApp: jest.fn()
}));

describe('SOS Controller - WhatsApp Broadcast Endpoints', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      userId: 'test-user-123',
      body: {},
      params: {},
      query: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('prepareWhatsAppBroadcast', () => {
    it('should return error if user is not authenticated', async () => {
      req.userId = null;
      req.body = { latitude: 12.34, longitude: 56.78 };

      await sosController.prepareWhatsAppBroadcast(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not authenticated'
      });
    });

    it('should return error if location is missing', async () => {
      req.body = {};

      await sosController.prepareWhatsAppBroadcast(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Location (latitude and longitude) is required'
      });
    });

    it('should return error if user has no contacts', async () => {
      req.body = { latitude: 12.34, longitude: 56.78 };
      contactModel.getUserContacts.mockReturnValue([]);

      await sosController.prepareWhatsAppBroadcast(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No trusted contacts found. Please add contacts before using emergency broadcast.'
      });
    });

    it('should return error if all contacts are invalid', async () => {
      req.body = { latitude: 12.34, longitude: 56.78 };
      const contacts = [
        { id: '1', name: 'Contact 1', phone: 'invalid' },
        { id: '2', name: 'Contact 2', phone: '123' }
      ];
      contactModel.getUserContacts.mockReturnValue(contacts);
      filterValidContacts.mockReturnValue([]);

      await sosController.prepareWhatsAppBroadcast(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No valid contacts found. All contacts have invalid phone numbers.'
      });
    });

    it('should successfully prepare broadcast with valid contacts', async () => {
      req.body = { latitude: 12.34, longitude: 56.78, message: 'Help me!' };
      const contacts = [
        { id: '1', name: 'Contact 1', phone: '9876543210' },
        { id: '2', name: 'Contact 2', phone: '+919876543211' }
      ];
      const validContacts = contacts;
      const mockAlert = {
        id: 'alert-123',
        userId: 'test-user-123',
        latitude: 12.34,
        longitude: 56.78,
        message: 'Help me!',
        status: 'active'
      };

      contactModel.getUserContacts.mockReturnValue(contacts);
      filterValidContacts.mockReturnValue(validContacts);
      normalizePhoneNumber.mockImplementation(phone => 
        phone.startsWith('+') ? phone : `+91${phone}`
      );
      alertModel.logAlert.mockReturnValue(mockAlert);

      await sosController.prepareWhatsAppBroadcast(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          alertId: 'alert-123',
          validContactCount: 2,
          invalidContactCount: 0
        })
      );
    });

    it('should filter out invalid contacts and proceed with valid ones', async () => {
      req.body = { latitude: 12.34, longitude: 56.78 };
      const contacts = [
        { id: '1', name: 'Valid Contact', phone: '9876543210' },
        { id: '2', name: 'Invalid Contact', phone: 'invalid' }
      ];
      const validContacts = [contacts[0]];
      const mockAlert = {
        id: 'alert-123',
        userId: 'test-user-123',
        latitude: 12.34,
        longitude: 56.78,
        status: 'active'
      };

      contactModel.getUserContacts.mockReturnValue(contacts);
      filterValidContacts.mockReturnValue(validContacts);
      normalizePhoneNumber.mockReturnValue('+919876543210');
      alertModel.logAlert.mockReturnValue(mockAlert);

      await sosController.prepareWhatsAppBroadcast(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          validContactCount: 1,
          invalidContactCount: 1
        })
      );
    });

    it('should include formatted message with location', async () => {
      req.body = { latitude: 12.34, longitude: 56.78, message: 'Emergency!' };
      const contacts = [{ id: '1', name: 'Contact', phone: '9876543210' }];
      const mockAlert = { id: 'alert-123', userId: 'test-user-123' };

      contactModel.getUserContacts.mockReturnValue(contacts);
      filterValidContacts.mockReturnValue(contacts);
      normalizePhoneNumber.mockReturnValue('+919876543210');
      alertModel.logAlert.mockReturnValue(mockAlert);

      await sosController.prepareWhatsAppBroadcast(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          formattedMessage: expect.stringContaining('⚠️ EMERGENCY ALERT!'),
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          formattedMessage: expect.stringContaining('https://maps.google.com/?q=12.34,56.78'),
        })
      );
    });
  });

  describe('logWhatsAppBroadcast', () => {
    it('should return error if user is not authenticated', async () => {
      req.userId = null;
      req.body = { alertId: 'alert-123', contactsAttempted: 2, contactsSuccessful: 2 };

      await sosController.logWhatsAppBroadcast(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not authenticated'
      });
    });

    it('should return error if alertId is missing', async () => {
      req.body = { contactsAttempted: 2, contactsSuccessful: 2 };

      await sosController.logWhatsAppBroadcast(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Alert ID is required'
      });
    });

    it('should return error if contactsAttempted or contactsSuccessful is missing', async () => {
      req.body = { alertId: 'alert-123' };

      await sosController.logWhatsAppBroadcast(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'contactsAttempted and contactsSuccessful are required'
      });
    });

    it('should return error if alert is not found', async () => {
      req.body = { alertId: 'alert-123', contactsAttempted: 2, contactsSuccessful: 2 };
      alertModel.getAlertById.mockReturnValue(null);

      await sosController.logWhatsAppBroadcast(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Alert not found'
      });
    });

    it('should return error if user does not own the alert', async () => {
      req.body = { alertId: 'alert-123', contactsAttempted: 2, contactsSuccessful: 2 };
      const mockAlert = { id: 'alert-123', userId: 'different-user' };
      alertModel.getAlertById.mockReturnValue(mockAlert);

      await sosController.logWhatsAppBroadcast(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to update this alert'
      });
    });
  });
});
