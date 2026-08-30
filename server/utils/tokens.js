const crypto = require('crypto');

// Raw value is emailed/texted to the user and never stored; only its hash is
// persisted, mirroring how passwords are handled.
const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

const generateSecureToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  return { rawToken, tokenHash: hashValue(rawToken) };
};

const generateOTP = () => {
  const otp = crypto.randomInt(100000, 1000000).toString();
  return { otp, otpHash: hashValue(otp) };
};

const maskPhone = (phone) => {
  if (!phone || phone.length < 4) return phone;
  return `${phone.slice(0, -4).replace(/\d/g, '*')}${phone.slice(-4)}`;
};

module.exports = { hashValue, generateSecureToken, generateOTP, maskPhone };
