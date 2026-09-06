/**
 * Payment Routes
 * Razorpay payment endpoints
 */

const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  verifyPayment, 
  getSubscription,
  testPayment 
} = require('../controllers/paymentController');
const { allowGuestUser, authenticateUser } = require('../middleware/auth');

/**
 * Create payment order
 * POST /api/payments/create-order
 * Body: { userId }
 */
router.post('/create-order', allowGuestUser, (req, res) => {
  createOrder(req, res);
});

/**
 * Verify payment signature
 * POST /api/payments/verify
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, userId }
 */
router.post('/verify', (req, res) => {
  verifyPayment(req, res);
});

/**
 * Get user subscription
 * GET /api/payments/subscription
 * Header: x-user-id
 */
router.get('/subscription', authenticateUser, (req, res) => {
  getSubscription(req, res);
});

/**
 * Test payment endpoint
 * GET /api/payments/test
 */
router.get('/test', (req, res) => {
  testPayment(req, res);
});

module.exports = router;
