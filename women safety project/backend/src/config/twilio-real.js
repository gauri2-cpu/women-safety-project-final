/**
 * Twilio SMS/WhatsApp Configuration - REAL MODE
 * Sends actual SMS and WhatsApp messages via Twilio
 * 
 * Setup Instructions:
 * 1. Sign up at https://www.twilio.com
 * 2. Get Account SID, Auth Token, and Phone Number
 * 3. Add to .env file
 * 4. Rename this file to twilio.js (replace the mock version)
 */

require('dotenv').config();

// Check if Twilio credentials are configured
const USE_REAL_TWILIO = process.env.TWILIO_ACCOUNT_SID && 
                        process.env.TWILIO_AUTH_TOKEN &&
                        !process.env.TWILIO_ACCOUNT_SID.includes('YOUR');

if (!USE_REAL_TWILIO) {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  ⚠️  TWILIO NOT CONFIGURED - MOCK MODE                ║');
  console.log('║  Messages will be logged to console only              ║');
  console.log('║  Add Twilio credentials to .env to enable real SMS    ║');
  console.log('╚════════════════════════════════════════════════════════╝');
}

let twilioClient = null;

if (USE_REAL_TWILIO) {
  const twilio = require('twilio');
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log('✅ Twilio configured - Real SMS/WhatsApp enabled');
}

/**
 * Send SMS via Twilio
 * @param {string} toPhoneNumber - Recipient phone number (E.164 format: +919876543210)
 * @param {string} message - Message content
 * @returns {Promise}
 */
async function sendSMS(toPhoneNumber, message) {
  if (!USE_REAL_TWILIO || !twilioClient) {
    // MOCK MODE - Log to console
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║               📨 SMS ALERT (TEST MODE)                 ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`📱 To Phone: ${toPhoneNumber}`);
    console.log(`📝 Message: ${message}`);
    console.log(`⏰ Sent at: ${new Date().toISOString()}`);
    console.log('╔════════════════════════════════════════════════════════╝\n');
    
    return {
      sid: 'mock-msg-' + Date.now(),
      status: 'logged-to-console'
    };
  }

  try {
    // REAL TWILIO MODE
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhoneNumber
    });

    console.log(`✅ SMS sent to ${toPhoneNumber}: ${result.sid}`);
    return result;
  } catch (error) {
    console.error(`❌ Error sending SMS to ${toPhoneNumber}:`, error.message);
    throw error;
  }
}

/**
 * Send WhatsApp message via Twilio
 * @param {string} toPhoneNumber - Recipient phone number (E.164 format: +919876543210)
 * @param {string} message - Message content
 * @returns {Promise}
 */
async function sendWhatsApp(toPhoneNumber, message) {
  if (!USE_REAL_TWILIO || !twilioClient) {
    // MOCK MODE - Log to console
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║            💬 WhatsApp ALERT (TEST MODE)               ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`📱 To Phone: ${toPhoneNumber}`);
    console.log(`📝 Message: ${message}`);
    console.log(`⏰ Sent at: ${new Date().toISOString()}`);
    console.log('╔════════════════════════════════════════════════════════╝\n');
    
    return {
      sid: 'mock-msg-' + Date.now(),
      status: 'logged-to-console'
    };
  }

  try {
    // Clean phone number (remove 'whatsapp:' prefix if present)
    const cleanPhone = toPhoneNumber.replace('whatsapp:', '');
    
    // REAL TWILIO WHATSAPP MODE
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER || `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${cleanPhone}`
    });

    console.log(`✅ WhatsApp sent to ${cleanPhone}: ${result.sid}`);
    return result;
  } catch (error) {
    console.error(`❌ Error sending WhatsApp to ${toPhoneNumber}:`, error.message);
    // Fallback to SMS if WhatsApp fails
    console.log(`📱 Falling back to SMS for ${toPhoneNumber}`);
    return await sendSMS(toPhoneNumber.replace('whatsapp:', ''), message);
  }
}

module.exports = {
  sendSMS,
  sendWhatsApp
};
