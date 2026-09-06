/**
 * User Model (Mongoose)
 * Defines schema for users collection
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true
    },
    email: {
      type: String,
      sparse: true,
      index: true
    },
    name: String,
    phone: String,
    isGuest: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'users', timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
