/**
 * Contact Model (Mongoose)
 * Defines schema for contacts collection
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const contactSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'contacts', timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
