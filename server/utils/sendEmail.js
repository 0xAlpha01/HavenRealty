const nodemailer = require('nodemailer');

const isSmtpConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
);

let transporter;
if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    // Node sockets never time out on their own, so without these a slow or
    // unreachable SMTP host (common for outbound mail from cloud hosts like
    // Render) can hang the connection for minutes instead of failing fast.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    // Some SMTP hosts resolve to both an IPv4 and IPv6 address. Unlike
    // fetch()'s automatic Happy-Eyeballs fallback, a raw socket connection
    // doesn't retry the other family - on a network with broken IPv6 routing
    // this fails outright (ENETUNREACH) instead of falling back to IPv4.
    family: 4,
  });
}

// Sends an email if SMTP is configured; otherwise logs and resolves silently
// so the rest of the request flow never fails because of email delivery.
const sendEmail = async ({ to, subject, html }) => {
  if (!isSmtpConfigured) {
    console.log(`[email skipped - SMTP not configured] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
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
