const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const sendEmail = require('../utils/sendEmail');

// @desc    Create a property inquiry
// @route   POST /api/inquiries
// @access  Private
const createInquiry = asyncHandler(async (req, res) => {
  const { propertyId, name, email, phone, message } = req.body;

  if (!propertyId || !name || !email || !phone || !message) {
    throw new ApiError(400, 'All fields are required');
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const inquiry = await Inquiry.create({
    user: req.user._id,
    property: property._id,
    owner: property.owner,
    name,
    email,
    phone,
    message,
  });

  const populated = await inquiry.populate('property', 'title');

  sendEmail({
    to: email,
    subject: `Inquiry received for ${property.title}`,
    html: `<p>Hi ${name},</p><p>Thanks for your interest in <strong>${property.title}</strong>. The property owner will contact you shortly.</p>`,
  });

  res.status(201).json({
    success: true,
    message: 'Inquiry sent successfully',
    data: populated,
  });
});

// @desc    Get inquiries for the current user (sent by them or received as owner)
// @route   GET /api/inquiries
// @access  Private
const getInquiries = asyncHandler(async (req, res) => {
  const scope = req.query.scope === 'received' ? 'received' : 'sent';
  const filter = scope === 'received' ? { owner: req.user._id } : { user: req.user._id };

  const inquiries = await Inquiry.find(filter)
    .sort({ createdAt: -1 })
    .populate('property', 'title images price city state')
    .populate('user', 'fullName email avatar')
    .populate('owner', 'fullName email avatar');

  res.status(200).json({ success: true, data: inquiries });
});

// @desc    Get a single inquiry
// @route   GET /api/inquiries/:id
// @access  Private
const getInquiryById = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id)
    .populate('property', 'title images price city state')
    .populate('user', 'fullName email avatar')
    .populate('owner', 'fullName email avatar');

  if (!inquiry) {
    throw new ApiError(404, 'Inquiry not found');
  }

  const isParticipant =
    String(inquiry.user._id) === String(req.user._id) || String(inquiry.owner._id) === String(req.user._id);
  if (!isParticipant && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to view this inquiry');
  }

  res.status(200).json({ success: true, data: inquiry });
});

// @desc    Update inquiry status (owner only)
// @route   PUT /api/inquiries/:id
// @access  Private
const updateInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) {
    throw new ApiError(404, 'Inquiry not found');
  }

  const isOwner = String(inquiry.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to update this inquiry');
  }

  const { status } = req.body;
  if (!['pending', 'contacted', 'closed'].includes(status)) {
    throw new ApiError(400, 'Invalid inquiry status');
  }

  inquiry.status = status;
  await inquiry.save();

  res.status(200).json({ success: true, message: 'Inquiry updated', data: inquiry });
});

module.exports = { createInquiry, getInquiries, getInquiryById, updateInquiry };
