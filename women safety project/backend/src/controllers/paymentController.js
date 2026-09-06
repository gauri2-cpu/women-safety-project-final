/**
 * Payment Controller
 * Handles Razorpay payment processing
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const { 
  createSubscription, 
  activateSubscriptionAfterPayment,
  getUserSubscription 
} = require('../models/subscriptionModel');
const { getUserById } = require('../models/userModel');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1IfG5dHeQbYvYZ',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'CdZPV6RMGnDSJhB7T8kL9pQ2wX3yZ4aB'
});

/**
 * Create Razorpay order for premium subscription
 * POST /api/payments/create-order
 */
async function createOrder(req, res) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }
    
    // Verify user exists
    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create Razorpay order
    const options = {
      amount: 9900, // ₹99 in paise
      currency: 'INR',
      receipt: `order_${userId}_${Date.now()}`,
      payment_capture: 1, // Auto capture
      notes: {
        userId: userId,
        email: user.email,
        name: user.name,
        phone: user.phone
      }
    };
    
    const order = await razorpay.orders.create(options);
    
    // Create subscription record
    const subscription = createSubscription(userId, 'prime', order.id);
    
    console.log(`✅ Razorpay order created: ${order.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Payment order created',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      subscriptionId: subscription.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_1IfG5dHeQbYvYZ'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message
    });
  }
}

/**
 * Verify Razorpay payment
 * POST /api/payments/verify
 */
async function verifyPayment(req, res) {
  try {
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature,
      userId 
    } = req.body;
    
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details'
      });
    }
    
    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'CdZPV6RMGnDSJhB7T8kL9pQ2wX3yZ4aB')
      .update(body)
      .digest('hex');
    
    if (expectedSignature !== razorpaySignature) {
      console.error('❌ Signature verification failed');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }
    
    // Signature verified - activate subscription
    const subscription = activateSubscriptionAfterPayment(
      userId,
      razorpayPaymentId,
      razorpayOrderId
    );
    
    console.log(`✅ Payment verified and subscription activated: ${subscription.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      subscriptionId: subscription.id,
      subscription: subscription
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
}

/**
 * Get user subscription details
 * GET /api/payments/subscription
 */
function getSubscription(req, res) {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }
    
    const subscription = getUserSubscription(userId);
    
    res.status(200).json({
      success: true,
      subscription: subscription
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message
    });
  }
}

/**
 * Test payment (for development)
 * POST /api/payments/test-payment
 */
function testPayment(req, res) {
  try {
    res.status(200).json({
      success: true,
      message: 'Test payment endpoint - For development only',
      testCard: {
        number: '4111111111111111',
        expiry: '12/25',
        cvv: '123'
      },
      testAmount: 99,
      note: 'Use Razorpay test credentials to process test payments'
    });
  } catch (error) {
    console.error('Error getting test payment info:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test payment info',
      error: error.message
    });
  }
}

module.exports = {
  createOrder,
  verifyPayment,
  getSubscription,
  testPayment
};
