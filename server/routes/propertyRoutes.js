const express = require('express');
const {
  getProperties,
  getFeaturedProperties,
  getPropertyCategoryCounts,
  getMyProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  reportProperty,
} = require('../controllers/propertyController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/categories', getPropertyCategoryCounts);
router.get('/my-properties', protect, getMyProperties);
router.get('/:id', optionalAuth, getPropertyById);
router.post('/', protect, upload.array('images', 10), createProperty);
router.put('/:id', protect, upload.array('images', 10), updateProperty);
router.delete('/:id', protect, deleteProperty);
router.post('/:id/report', protect, reportProperty);

module.exports = router;
