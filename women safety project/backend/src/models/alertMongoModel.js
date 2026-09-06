/**
 * Alert Model (Mongoose)
 * Defines schema for SOS alerts collection
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const alertSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    latitude: Number,
    longitude: Number,
    message: String,
    notificationMethod: {
      type: String,
      enum: ['sms', 'whatsapp', 'both'],
      default: 'sms'
    },
    status: {
      type: String,
      enum: ['triggered', 'acknowledged', 'resolved'],
      default: 'triggered'
    },
    contactsNotified: [{
      contactId: String,
      phone: String,
      method: String,
      sent: { type: Boolean, default: false }
    }],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    resolvedAt: Date,
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'alerts', timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
