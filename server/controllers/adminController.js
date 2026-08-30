const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const sendEmail = require('../utils/sendEmail');
const { invalidateByPrefix } = require('../services/cacheService');

const invalidatePropertiesCache = () => invalidateByPrefix('properties');

// @desc    Get platform statistics for admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProperties,
    pendingProperties,
    approvedProperties,
    totalInquiries,
    propertiesByType,
    usersPerMonth,
    propertiesPerMonth,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' } }),
    Property.countDocuments(),
    Property.countDocuments({ status: 'pending' }),
    Property.countDocuments({ status: 'approved' }),
    Inquiry.countDocuments(),
    Property.aggregate([{ $group: { _id: '$propertyType', count: { $sum: 1 } } }]),
    User.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    Property.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProperties,
      pendingProperties,
      approvedProperties,
      totalInquiries,
      propertiesByType,
      usersPerMonth,
      propertiesPerMonth,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: users });
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  if (user.role === 'admin') {
    throw new ApiError(400, 'Cannot delete an admin account');
  }

  await Property.deleteMany({ owner: user._id });
  await user.deleteOne();

  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

// @desc    Toggle a user's active status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  if (user.role === 'admin') {
    throw new ApiError(400, 'Cannot modify an admin account');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: user,
  });
});

// @desc    Get all properties (any status) for admin management
// @route   GET /api/admin/properties
// @access  Private/Admin
const getAllProperties = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.reported === 'true') filter.isReported = true;

  const properties = await Property.find(filter)
    .sort({ createdAt: -1 })
    .populate('owner', 'fullName email phone');

  res.status(200).json({ success: true, data: properties });
});

// @desc    Approve a pending property
// @route   PUT /api/admin/properties/:id/approve
// @access  Private/Admin
const approveProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate('owner', 'fullName email');
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  property.status = 'approved';
  property.rejectionReason = '';
  await property.save();
  await invalidatePropertiesCache();

  sendEmail({
    to: property.owner.email,
    subject: 'Your property listing has been approved',
    html: `<p>Hi ${property.owner.fullName},</p><p>Great news! Your listing "<strong>${property.title}</strong>" has been approved and is now live.</p>`,
  });

  res.status(200).json({ success: true, message: 'Property approved', data: property });
});

// @desc    Reject a pending property
// @route   PUT /api/admin/properties/:id/reject
// @access  Private/Admin
const rejectProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate('owner', 'fullName email');
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  property.status = 'rejected';
  property.rejectionReason = req.body.reason || 'Did not meet platform guidelines';
  await property.save();
  await invalidatePropertiesCache();

  sendEmail({
    to: property.owner.email,
    subject: 'Your property listing was rejected',
    html: `<p>Hi ${property.owner.fullName},</p><p>Your listing "<strong>${property.title}</strong>" was rejected. Reason: ${property.rejectionReason}</p>`,
  });

  res.status(200).json({ success: true, message: 'Property rejected', data: property });
});

// @desc    Delete any property
// @route   DELETE /api/admin/properties/:id
// @access  Private/Admin
const adminDeleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  await property.deleteOne();
  await invalidatePropertiesCache();
  res.status(200).json({ success: true, message: 'Property deleted successfully' });
});

// @desc    Dismiss a property report
// @route   PUT /api/admin/properties/:id/dismiss-report
// @access  Private/Admin
const dismissReport = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  property.isReported = false;
  property.reportReason = '';
  await property.save();

  res.status(200).json({ success: true, message: 'Report dismissed', data: property });
});

module.exports = {
  getStats,
  getUsers,
  deleteUser,
  updateUserStatus,
  getAllProperties,
  approveProperty,
  rejectProperty,
  adminDeleteProperty,
  dismissReport,
};
