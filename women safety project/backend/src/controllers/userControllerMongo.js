/**
 * User Controller (MongoDB)
 * Handles user-related operations (signup, login, profile)
 */

const User = require('../models/userMongoModel');
const { v4: uuidv4 } = require('uuid');

/**
 * Guest Login - Create temporary guest user
 * @route POST /api/users/guest-login
 */
async function guestLogin(req, res) {
  try {
    const guestId = uuidv4();
    
    const guestUser = new User({
      id: guestId,
      isGuest: true
    });

    await guestUser.save();

    return res.status(200).json({
      success: true,
      message: 'Guest login successful',
      user: guestUser,
      token: guestUser.id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error during guest login',
      error: error.message
    });
  }
}

/**
 * Email/Phone Signup
 * @route POST /api/users/signup
 */
async function signup(req, res) {
  try {
    const { email, name, phone } = req.body;

    // Validation
    if (!email || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, and phone are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = new User({
      email,
      name,
      phone,
      isGuest: false,
      status: 'active'
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: user,
      token: user.id
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Email/Phone Login
 * @route POST /api/users/login
 */
async function login(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: user,
      token: user.id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
}

/**
 * Get user profile
 * @route GET /api/users/profile
 */
async function getProfile(req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
}

/**
 * Update user profile
 * @route PUT /api/users/profile
 */
async function updateProfile(req, res) {
  try {
    const userId = req.userId;
    const { name, phone } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await User.findOneAndUpdate(
      { id: userId },
      { name, phone, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
}

module.exports = {
  guestLogin,
  signup,
  login,
  getProfile,
  updateProfile
};
