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

  await sendEmail({
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `[Contact Form] ${subject}`,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
  });

  res.status(200).json({ success: true, message: 'Your message has been sent. We will get back to you shortly.' });
});

module.exports = { submitContactMessage };
