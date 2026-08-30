const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const Property = require('../models/Property');
const { uploadImage, deleteImage } = require('../utils/uploadImage');
const { buildKey, getCache, setCache, invalidateByPrefix } = require('../services/cacheService');

const PROPERTIES_CACHE_PREFIX = 'properties';
const LIST_TTL_SECONDS = 120;
const FEATURED_TTL_SECONDS = 300;
const CATEGORIES_TTL_SECONDS = 300;

const invalidatePropertiesCache = () => invalidateByPrefix(PROPERTIES_CACHE_PREFIX);

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_low: { price: 1 },
  price_desc: { price: -1 },
  price_high: { price: -1 },
  most_viewed: { views: -1 },
};

const buildFilterQuery = (query, { publicOnly = true } = {}) => {
  const filter = {};

  if (publicOnly) {
    filter.status = 'approved';
  } else if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.type) filter.propertyType = query.type;
  if (query.propertyType) filter.propertyType = query.propertyType;
  if (query.listingType) filter.listingType = query.listingType;
  if (query.city) filter.city = new RegExp(query.city, 'i');
  if (query.state) filter.state = new RegExp(query.state, 'i');

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.bedrooms) filter.bedrooms = { $gte: Number(query.bedrooms) };
  if (query.bathrooms) filter.bathrooms = { $gte: Number(query.bathrooms) };

  if (query.minArea || query.maxArea) {
    filter.area = {};
    if (query.minArea) filter.area.$gte = Number(query.minArea);
    if (query.maxArea) filter.area.$lte = Number(query.maxArea);
  }

  if (query.amenities) {
    const amenitiesList = Array.isArray(query.amenities)
      ? query.amenities
      : query.amenities.split(',');
    filter.amenities = { $all: amenitiesList };
  }

  return filter;
};

// @desc    Get all properties with search, filters, sorting, pagination
// @route   GET /api/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
  const cacheKey = buildKey(`${PROPERTIES_CACHE_PREFIX}:list`, req.query);
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const skip = (page - 1) * limit;

  const filter = buildFilterQuery(req.query, { publicOnly: true });
  const sort = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.newest;

  const [properties, total] = await Promise.all([
    Property.find(filter).sort(sort).skip(skip).limit(limit).populate('owner', 'fullName email phone avatar role'),
    Property.countDocuments(filter),
  ]);

  const payload = {
    success: true,
    properties,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
    total,
  };

  await setCache(cacheKey, payload, LIST_TTL_SECONDS);
  res.status(200).json(payload);
});

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
const getFeaturedProperties = asyncHandler(async (req, res) => {
  const cacheKey = buildKey(`${PROPERTIES_CACHE_PREFIX}:featured`, req.query);
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const limit = Math.min(Number(req.query.limit) || 6, 20);
  const properties = await Property.find({ status: 'approved', isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('owner', 'fullName email phone avatar role');

  const payload = { success: true, data: properties };
  await setCache(cacheKey, payload, FEATURED_TTL_SECONDS);
  res.status(200).json(payload);
});

// @desc    Get counts of properties grouped by type (for category section)
// @route   GET /api/properties/categories
// @access  Public
const getPropertyCategoryCounts = asyncHandler(async (req, res) => {
  const cacheKey = `${PROPERTIES_CACHE_PREFIX}:categories:all`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const counts = await Property.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: '$propertyType', count: { $sum: 1 } } },
  ]);

  const result = counts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const payload = { success: true, data: result };
  await setCache(cacheKey, payload, CATEGORIES_TTL_SECONDS);
  res.status(200).json(payload);
});

// @desc    Get logged-in user's properties
// @route   GET /api/properties/my-properties
// @access  Private
const getMyProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: properties });
});

// @desc    Get a single property by id
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate(
    'owner',
    'fullName email phone avatar role bio location createdAt'
  );

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const isOwner = req.user && String(property.owner._id) === String(req.user._id);
  const isAdmin = req.user && req.user.role === 'admin';

  if (property.status !== 'approved' && !isOwner && !isAdmin) {
    throw new ApiError(404, 'Property not found');
  }

  property.views += 1;
  await property.save();

  const similarProperties = await Property.find({
    _id: { $ne: property._id },
    status: 'approved',
    propertyType: property.propertyType,
    city: property.city,
  })
    .limit(4)
    .populate('owner', 'fullName avatar');

  res.status(200).json({ success: true, data: { property, similarProperties } });
});

// @desc    Create a new property listing
// @route   POST /api/properties
// @access  Private
const createProperty = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    propertyType,
    listingType,
    address,
    city,
    state,
    country,
    bedrooms,
    bathrooms,
    parkingSpaces,
    area,
    yearBuilt,
    amenities,
    features,
  } = req.body;

  if (!title || !description || !price || !propertyType || !listingType || !address || !city || !state || !area) {
    throw new ApiError(400, 'Please fill in all required property fields');
  }

  const files = req.files || [];
  if (files.length === 0) {
    throw new ApiError(400, 'Please upload at least one property image');
  }

  const uploadedImages = await Promise.all(
    files.map((file) => uploadImage(file, 'real-estate/properties'))
  );

  const parseList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  };

  const property = await Property.create({
    title,
    description,
    price,
    propertyType,
    listingType,
    address,
    city,
    state,
    country: country || 'Nigeria',
    bedrooms: bedrooms || 0,
    bathrooms: bathrooms || 0,
    parkingSpaces: parkingSpaces || 0,
    area,
    yearBuilt: yearBuilt || undefined,
    amenities: parseList(amenities),
    features: parseList(features),
    images: uploadedImages,
    owner: req.user._id,
    status: 'pending',
  });

  await invalidatePropertiesCache();

  res.status(201).json({
    success: true,
    message: 'Property submitted successfully and is pending approval',
    data: property,
  });
});

// @desc    Update a property listing
// @route   PUT /api/properties/:id
// @access  Private (owner or admin)
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const isOwner = String(property.owner) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to update this property');
  }

  const updatableFields = [
    'title',
    'description',
    'price',
    'propertyType',
    'listingType',
    'address',
    'city',
    'state',
    'country',
    'bedrooms',
    'bathrooms',
    'parkingSpaces',
    'area',
    'yearBuilt',
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) property[field] = req.body[field];
  });

  const parseList = (value) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  };

  const amenities = parseList(req.body.amenities);
  const features = parseList(req.body.features);
  if (amenities) property.amenities = amenities;
  if (features) property.features = features;

  if (req.body.removedImageIds) {
    const removedIds = Array.isArray(req.body.removedImageIds)
      ? req.body.removedImageIds
      : [req.body.removedImageIds];
    const imagesToRemove = property.images.filter((img) => removedIds.includes(String(img._id)));
    await Promise.all(imagesToRemove.map((img) => deleteImage(img.publicId)));
    property.images = property.images.filter((img) => !removedIds.includes(String(img._id)));
  }

  const files = req.files || [];
  if (files.length > 0) {
    const uploadedImages = await Promise.all(
      files.map((file) => uploadImage(file, 'real-estate/properties'))
    );
    property.images.push(...uploadedImages);
  }

  if (property.images.length === 0) {
    throw new ApiError(400, 'A property must have at least one image');
  }

  // Edits from a non-admin owner require re-approval.
  if (isOwner && !isAdmin) {
    property.status = 'pending';
    property.rejectionReason = '';
  }

  await property.save();
  await invalidatePropertiesCache();

  res.status(200).json({
    success: true,
    message: 'Property updated successfully',
    data: property,
  });
});

// @desc    Delete a property listing
// @route   DELETE /api/properties/:id
// @access  Private (owner or admin)
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  const isOwner = String(property.owner) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to delete this property');
  }

  await Promise.all(property.images.map((img) => deleteImage(img.publicId)));
  await property.deleteOne();
  await invalidatePropertiesCache();

  res.status(200).json({ success: true, message: 'Property deleted successfully' });
});

// @desc    Report a property as inappropriate or inaccurate
// @route   POST /api/properties/:id/report
// @access  Private
const reportProperty = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason) {
    throw new ApiError(400, 'Please provide a reason for the report');
  }

  const property = await Property.findById(req.params.id);
  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  property.isReported = true;
  property.reportReason = reason;
  await property.save();

  res.status(200).json({ success: true, message: 'Property reported. Our team will review it shortly.' });
});

module.exports = {
  getProperties,
  getFeaturedProperties,
  getPropertyCategoryCounts,
  getMyProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  reportProperty,
};
