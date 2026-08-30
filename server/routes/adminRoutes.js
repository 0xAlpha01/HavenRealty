const express = require('express');
const {
  getStats,
  getUsers,
  deleteUser,
  updateUserStatus,
  getAllProperties,
  approveProperty,
  rejectProperty,
  adminDeleteProperty,
  dismissReport,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/status', updateUserStatus);
router.get('/properties', getAllProperties);
router.put('/properties/:id/approve', approveProperty);
router.put('/properties/:id/reject', rejectProperty);
router.delete('/properties/:id', adminDeleteProperty);
router.put('/properties/:id/dismiss-report', dismissReport);

module.exports = router;
