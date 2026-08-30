const express = require('express');
const {
  sendMessage,
  getConversations,
  getConversationWithUser,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/:userId', getConversationWithUser);

module.exports = router;
