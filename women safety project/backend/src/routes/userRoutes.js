/**
 * User Routes
 * Handles user authentication and profile operations
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser, allowGuestUser } = require('../middleware/auth');

// Guest login - no authentication required
router.post('/guest-login', userController.guestLogin);

// User signup
router.post('/signup', userController.signup);

// User login
router.post('/login', userController.login);

// Get user profile (requires authentication)
router.get('/profile', authenticateUser, userController.getProfile);

// Update user profile (requires authentication)
router.put('/profile', authenticateUser, userController.updateProfile);

module.exports = router;
