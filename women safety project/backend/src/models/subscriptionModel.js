/**
 * Subscription Model
 * Manages user subscriptions and premium features
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData } = require('../config/database');

/**
 * Create new subscription
 */
function createSubscription(userId, plan = 'free', razorpayOrderId = null) {
  try {
    let subscriptions = readData('subscriptions') || [];
    
    const subscription = {
      id: uuidv4(),
      userId: userId,
      plan: plan, // 'free' or 'prime'
      status: 'active', // active, expired, cancelled
      startDate: new Date().toISOString(),
      endDate: plan === 'prime' ? 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days
        null,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: null,
      amount: plan === 'prime' ? 9900 : 0, // in paise (99 INR = 9900 paise)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    subscriptions.push(subscription);
    writeData('subscriptions', subscriptions);
    
    console.log(`✅ Subscription created for user ${userId}: ${plan}`);
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Get user's current subscription
 */
function getUserSubscription(userId) {
  try {
    let subscriptions = readData('subscriptions') || [];
    
    const subscription = subscriptions.find(s => s.userId === userId && s.status === 'active');
    
    if (!subscription) {
      // Return default free subscription
      return {
        id: null,
        userId: userId,
        plan: 'free',
        status: 'active',
        contactLimit: 3,
        alertHistoryDays: 7,
        isPremium: false
      };
    }
    
    // Check if subscription expired
    if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
      subscription.status = 'expired';
      updateSubscription(subscription.id, subscription);
      
      // Return free plan for expired users
      return {
        id: null,
        userId: userId,
        plan: 'free',
        status: 'expired',
        contactLimit: 3,
        alertHistoryDays: 7,
        isPremium: false
      };
    }
    
    // Add feature limits based on plan
    return {
      ...subscription,
      isPremium: subscription.plan === 'prime',
      contactLimit: subscription.plan === 'prime' ? 999 : 3,
      alertHistoryDays: subscription.plan === 'prime' ? 90 : 7,
      features: getPremiumFeatures(subscription.plan)
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
}

/**
 * Get premium features based on plan
 */
function getPremiumFeatures(plan) {
  if (plan === 'prime') {
    return {
      unlimitedContacts: true,
      alertHistory90Days: true,
      realTimeLocation: true,
      emergencyGroups: true,
      prioritySupport: true,
      fakeCallFeature: true,
      analyticsEnabled: true,
      advancedAnalytics: false
    };
  }
  
  return {
    unlimitedContacts: false,
    alertHistory90Days: false,
    realTimeLocation: false,
    emergencyGroups: false,
    prioritySupport: false,
    fakeCallFeature: false,
    analyticsEnabled: false,
    advancedAnalytics: false
  };
}

/**
 * Update subscription with payment info
 */
function updateSubscription(subscriptionId, updates) {
  try {
    let subscriptions = readData('subscriptions') || [];
    
    const index = subscriptions.findIndex(s => s.id === subscriptionId);
    if (index === -1) {
      throw new Error('Subscription not found');
    }
    
    subscriptions[index] = {
      ...subscriptions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    writeData('subscriptions', subscriptions);
    console.log(`✅ Subscription ${subscriptionId} updated`);
    return subscriptions[index];
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * Verify payment and activate subscription
 */
function activateSubscriptionAfterPayment(userId, razorpayPaymentId, razorpayOrderId) {
  try {
    let subscriptions = readData('subscriptions') || [];
    
    // Find subscription with this order ID
    const subscription = subscriptions.find(s => 
      s.userId === userId && s.razorpayOrderId === razorpayOrderId
    );
    
    if (!subscription) {
      throw new Error('Subscription not found for this order');
    }
    
    // Mark as active with payment info
    subscription.razorpayPaymentId = razorpayPaymentId;
    subscription.status = 'active';
    subscription.startDate = new Date().toISOString();
    subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    subscription.updatedAt = new Date().toISOString();
    
    writeData('subscriptions', subscriptions);
    console.log(`✅ Subscription activated for user ${userId}`);
    return subscription;
  } catch (error) {
    console.error('Error activating subscription:', error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
function cancelSubscription(subscriptionId) {
  try {
    let subscriptions = readData('subscriptions') || [];
    
    const subscription = subscriptions.find(s => s.id === subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    
    subscription.status = 'cancelled';
    subscription.updatedAt = new Date().toISOString();
    
    writeData('subscriptions', subscriptions);
    console.log(`✅ Subscription ${subscriptionId} cancelled`);
    return subscription;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Get subscription statistics
 */
function getSubscriptionStats() {
  try {
    let subscriptions = readData('subscriptions') || [];
    
    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      prime: subscriptions.filter(s => s.plan === 'prime' && s.status === 'active').length,
      free: subscriptions.filter(s => s.plan === 'free' && s.status === 'active').length,
      revenue: subscriptions
        .filter(s => s.plan === 'prime' && s.status === 'active' && s.razorpayPaymentId)
        .reduce((sum, s) => sum + s.amount, 0) / 100 // Convert from paise to rupees
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting subscription stats:', error);
    throw error;
  }
}

module.exports = {
  createSubscription,
  getUserSubscription,
  getPremiumFeatures,
  updateSubscription,
  activateSubscriptionAfterPayment,
  cancelSubscription,
  getSubscriptionStats
};
