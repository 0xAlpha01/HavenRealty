const crypto = require('crypto');

// Raw value is emailed/texted to the user and never stored; only its hash is
// persisted, mirroring how passwords are handled.
const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

const generateSecureToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  return { rawToken, tokenHash: hashValue(rawToken) };
};

module.exports = { hashValue, generateSecureToken };
