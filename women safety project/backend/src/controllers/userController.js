/**
 * User Controller
 * Handles user-related operations (signup, login, profile)
 */

const userModel = require('../models/userModel');
const { v4: uuidv4 } = require('uuid');

/**
 * Guest Login - Create temporary guest user
 * @route POST /api/users/guest-login
 */
function guestLogin(req, res) {
  try {
    const guestId = uuidv4();
    
    const guestUser = {
      id: guestId,
      isGuest: true,
      createdAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: 'Guest login successful',
      user: guestUser,
      token: guestId
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
 * Email/Phone Signup (without OTP for MVP)
 * @route POST /api/users/signup
 */
function signup(req, res) {
  try {
    const { email, name, phone } = req.body;

    // Validation
    if (!email || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, and phone are required'
      });
    }

    // Create user
    const user = userModel.createUser({
      email,
      name,
      phone,
      isGuest: false
    });

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
function login(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = userModel.getUserByEmail(email);
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
function getProfile(req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = userModel.getUserById(userId);
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
function updateProfile(req, res) {
  try {
    const userId = req.userId;
    const { name, phone } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const updatedUser = userModel.updateUser(userId, { name, phone });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
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
