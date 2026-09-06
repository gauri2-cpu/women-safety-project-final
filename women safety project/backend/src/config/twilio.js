/**
 * SMS/WhatsApp Configuration - MOCK MODE (Local Testing)
 * Logs alerts to console instead of sending real SMS
 * Perfect for local testing and development
 * 
 * To use REAL AWS SMS:
 * 1. Get AWS credentials from https://console.aws.amazon.com/iam
 * 2. Update .env with real credentials
 * 3. Uncomment the AWS SNS code below
 * 4. Restart backend
 */

require('dotenv').config();

// Check if using real AWS or mock mode
const USE_MOCK_SMS = !process.env.AWS_ACCESS_KEY_ID || 
                     process.env.AWS_ACCESS_KEY_ID.includes('YOUR') ||
                     process.env.AWS_ACCESS_KEY_ID.includes('AKIA_YOUR');

if (USE_MOCK_SMS) {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  📱 SMS MOCK MODE - Local Testing                     ║');
  console.log('║  SMS/WhatsApp will be logged to console               ║');
  console.log('║  To enable real SMS: Add AWS credentials to .env      ║');
  console.log('╚════════════════════════════════════════════════════════╝');
}

/**
 * Send SMS to a contact (MOCK or REAL based on credentials)
 * @param {string} toPhoneNumber - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise} - Mock or AWS response
 */
async function sendSMS(toPhoneNumber, message) {
  if (USE_MOCK_SMS) {
    // MOCK MODE - Log to console
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║               📨 SMS ALERT (TEST MODE)                 ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`📱 To Phone: ${toPhoneNumber}`);
    console.log(`📝 Message: ${message}`);
    console.log(`⏰ Sent at: ${new Date().toISOString()}`);
    console.log('╔════════════════════════════════════════════════════════╗\n');
    
    // Return mock response
    return {
      MessageId: 'mock-msg-' + Date.now(),
      status: 'logged-to-console'
    };
  } else {
    // REAL AWS SNS MODE
    try {
      const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
      
      const snsClient = new SNSClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      
      const params = {
        Message: message,
        PhoneNumber: toPhoneNumber
      };
      
      const command = new PublishCommand(params);
      const response = await snsClient.send(command);
      console.log(`✅ SMS sent to ${toPhoneNumber}: ${response.MessageId}`);
      return response;
    } catch (error) {
      console.error(`❌ Error sending SMS to ${toPhoneNumber}:`, error.message);
      throw error;
    }
  }
}

/**
 * Send WhatsApp message (falls back to SMS)
 * @param {string} toPhoneNumber - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise}
 */
async function sendWhatsApp(toPhoneNumber, message) {
  try {
    const phoneNumber = toPhoneNumber.replace('whatsapp:', '');
    
    if (USE_MOCK_SMS) {
      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log('║            💬 WhatsApp ALERT (TEST MODE)               ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log(`📱 To Phone: ${phoneNumber}`);
      console.log(`📝 Message: ${message}`);
      console.log(`⏰ Sent at: ${new Date().toISOString()}`);
      console.log('ℹ️  AWS SNS sends as SMS (WhatsApp not natively supported)');
      console.log('╔════════════════════════════════════════════════════════╗\n');
      
      return {
        MessageId: 'mock-msg-' + Date.now(),
        status: 'logged-to-console'
      };
    } else {
      return await sendSMS(phoneNumber, `[WhatsApp] ${message}`);
    }
  } catch (error) {
    console.error(`Error sending WhatsApp to ${toPhoneNumber}:`, error.message);
    throw error;
  }
}

module.exports = {
  sendSMS,
  sendWhatsApp
};
