// SMS provider: Twilio example (or keep stub for demo)
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER;

let twilioClient = null;
if (TWILIO_SID && TWILIO_AUTH) {
  try {
    twilioClient = require('twilio')(TWILIO_SID, TWILIO_AUTH);
  } catch (e) {
    twilioClient = null;
  }
}

async function sendSMS(to, message) {
  if (twilioClient && TWILIO_FROM) {
    try {
      const result = await twilioClient.messages.create({
        body: message,
        from: TWILIO_FROM,
        to
      });
      console.log(`[SMS] Sent via Twilio to ${to}: ${message}`);
      return { success: true, provider: 'twilio', to, message, sid: result.sid };
    } catch (e) {
      console.warn('[SMS] Twilio send failed, falling back to stub:', e.message);
    }
  }
  // Fallback stub
  console.log(`[SMS STUB] Sending SMS to ${to}: ${message}`);
  return { success: true, provider: 'stub', to, message, sentAt: new Date().toISOString() };
}

module.exports = { sendSMS };
