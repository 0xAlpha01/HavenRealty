const express = require('express');
const {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiry,
} = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/', createInquiry);
router.get('/', getInquiries);
router.get('/:id', getInquiryById);
router.put('/:id', updateInquiry);

module.exports = router;
