const nodemailer = require('nodemailer');
const dns = require('dns');

const isSmtpConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
);

const resolveIPv4 = (hostname) =>
  new Promise((resolve, reject) => {
    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses.length) {
        reject(err || new Error(`No IPv4 address found for ${hostname}`));
        return;
      }
      resolve(addresses[0]);
    });
  });

// Nodemailer resolves both IPv4 and IPv6 addresses for the host and picks one
// at random, ignoring any family hint - on networks with broken IPv6 routing
// (Render included) that's an outright ENETUNREACH roughly half the time.
// Resolving to a literal IPv4 address ourselves makes Nodemailer skip its own
// DNS step entirely; servername is kept as the original hostname so the TLS
// certificate still validates against smtp.gmail.com instead of the raw IP.
const buildTransporter = async () => {
  const host = process.env.SMTP_HOST;
  let connectHost = host;
  try {
    connectHost = await resolveIPv4(host);
  } catch (error) {
    console.error(`Failed to resolve IPv4 address for ${host}: ${error.message}`);
  }

  return nodemailer.createTransport({
    host: connectHost,
    servername: host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Node sockets never time out on their own, so without these a slow or
    // unreachable SMTP host (common for outbound mail from cloud hosts like
    // Render) can hang the connection for minutes instead of failing fast.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

// Sends an email if SMTP is configured; otherwise logs and resolves silently
// so the rest of the request flow never fails because of email delivery.
const sendEmail = async ({ to, subject, html }) => {
  if (!isSmtpConfigured) {
    console.log(`[email skipped - SMTP not configured] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }

  try {
    const transporter = await buildTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return { skipped: false };
  } catch (error) {
    console.error(`Failed to send email to ${to}: ${error.message}`);
    return { skipped: true, error: error.message };
  }
};

module.exports = sendEmail;
