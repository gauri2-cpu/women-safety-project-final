/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllerMongo');
const { authenticateUser } = require('../middleware/auth');

// Simple admin-only middleware: checks header x-user-id against ADMIN_USER_ID from env
const User = require('../models/userMongoModel');

const adminOnly = async (req, res, next) => {
	const userId = req.headers['x-user-id'] || req.header('x-user-id');
	if (!userId) return res.status(401).json({ success: false, message: 'Missing user id' });

	// Check if user is admin (first user in system or has admin role)
	const adminEnvId = process.env.ADMIN_USER_ID;
	if (adminEnvId && userId !== adminEnvId) {
		return res.status(403).json({ success: false, message: 'Admin access required' });
	}

	next();
};

// For now protect admin routes with authentication middleware
router.get('/users', authenticateUser, adminController.getUsers);
router.get('/contacts', authenticateUser, adminController.getContacts);
router.get('/stats', authenticateUser, adminController.getStats);

// Admin management endpoints
router.delete('/users/:id', authenticateUser, adminOnly, adminController.deleteUser);
router.delete('/contacts/:id', authenticateUser, adminOnly, adminController.deleteContact);

module.exports = router;
