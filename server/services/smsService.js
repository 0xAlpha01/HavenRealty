const isTermiiConfigured = Boolean(process.env.TERMII_API_KEY && process.env.TERMII_SENDER_ID);
const TERMII_BASE_URL = process.env.TERMII_BASE_URL || 'https://api.ng.termii.com';

// Sends an SMS via Termii if credentials are configured; otherwise logs a
// safe development message (never the API key) and resolves without
// throwing, so the rest of the request flow never fails because of SMS
// delivery. In non-production environments the OTP itself is also logged so
// phone verification can be tested end-to-end without a live Termii account.
const sendSms = async (phoneNumber, message) => {
  if (!isTermiiConfigured) {
    console.log(`[sms skipped - Termii not configured] To: ${phoneNumber}`);
    return { skipped: true };
  }

  try {
    const response = await fetch(`${TERMII_BASE_URL}/api/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phoneNumber,
        from: process.env.TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: process.env.TERMII_API_KEY,
      }),
      // A slow/unreachable Termii endpoint must never hang the request that
      // triggered it - fail fast instead, same as the SMTP timeout fix.
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.code === 'ok' === false) {
      console.error(`Termii SMS request failed with status ${response.status}`);
      return { skipped: true };
    }

    return { skipped: false };
  } catch (error) {
    console.error(`Failed to send SMS: ${error.message}`);
    return { skipped: true };
  }
};

const sendOTP = async (phoneNumber, otp) => {
  const result = await sendSms(
    phoneNumber,
    `Your Haven Realty verification code is ${otp}. It expires in 10 minutes. Do not share this code.`
  );

  if (result.skipped && process.env.NODE_ENV !== 'production') {
    console.log(`[dev only - not sent via SMS] OTP for ${phoneNumber}: ${otp}`);
  }

  return result;
};

module.exports = { sendOTP };
