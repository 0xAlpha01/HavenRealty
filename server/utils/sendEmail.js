const { Resend } = require('resend');

const isResendConfigured = Boolean(process.env.RESEND_API_KEY);
const resend = isResendConfigured ? new Resend(process.env.RESEND_API_KEY) : null;

// Gmail SMTP from a personal account, sent through a cloud host like Render,
// gets silently accepted (250 OK) and then dropped by Google's abuse
// detection with no bounce and no spam-folder trace - unfixable from the
// app side. Resend is a proper transactional provider with real delivery
// and real error reporting, so failures are actually visible instead of
// disappearing.
const sendEmail = async ({ to, subject, html }) => {
  if (!isResendConfigured) {
    console.log(`[email skipped - Resend not configured] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }

  try {
    const sendPromise = resend.emails.send({
      from: process.env.EMAIL_FROM || 'Haven Realty <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    // The SDK exposes no built-in timeout, so bound it manually - same
    // never-hang-a-request principle applied to the SMTP and Termii calls.
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Resend request timed out')), 10000);
    });

    const { error } = await Promise.race([sendPromise, timeoutPromise]);

    if (error) {
      console.error(`Failed to send email to ${to}: ${error.message}`);
      return { skipped: true, error: error.message };
    }

    return { skipped: false };
  } catch (error) {
    console.error(`Failed to send email to ${to}: ${error.message}`);
    return { skipped: true, error: error.message };
  }
};

module.exports = sendEmail;
