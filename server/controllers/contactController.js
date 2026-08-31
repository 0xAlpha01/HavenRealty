const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit a general contact message
// @route   POST /api/contact
// @access  Public
const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    throw new ApiError(400, 'All fields are required');
  }

  // Don't make the sender wait on the outbound email round-trip - the
  // message is only useful to us, so any delivery failure is ours to deal
  // with, not something that should slow down the visitor's response.
  sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `[Contact Form] ${subject}`,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
  }).catch((error) => {
    console.error(`Failed to send contact form email: ${error.message}`);
  });

  res.status(200).json({ success: true, message: 'Your message has been sent. We will get back to you shortly.' });
});

module.exports = { submitContactMessage };
