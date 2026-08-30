const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const Favorite = require('../models/Favorite');
const Property = require('../models/Property');

// @desc    Get current user's saved properties
// @route   GET /api/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'property',
      populate: { path: 'owner', select: 'fullName email phone avatar' },
    });

  const properties = favorites.filter((fav) => fav.property).map((fav) => fav.property);

  res.status(200).json({ success: true, data: properties });
});

// @desc    Save a property to favorites
// @route   POST /api/favorites/:propertyId
// @access  Private
const addFavorite = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const existing = await Favorite.findOne({ user: req.user._id, property: property._id });
  if (existing) {
    return res.status(200).json({ success: true, message: 'Property already saved' });
  }

  await Favorite.create({ user: req.user._id, property: property._id });

  res.status(201).json({ success: true, message: 'Property saved to favorites' });
});

// @desc    Remove a property from favorites
// @route   DELETE /api/favorites/:propertyId
// @access  Private
const removeFavorite = asyncHandler(async (req, res) => {
  await Favorite.findOneAndDelete({ user: req.user._id, property: req.params.propertyId });
  res.status(200).json({ success: true, message: 'Property removed from favorites' });
});

module.exports = { getFavorites, addFavorite, removeFavorite };
