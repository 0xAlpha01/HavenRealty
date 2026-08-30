const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message to another user
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, body, propertyId } = req.body;

  if (!recipientId || !body) {
    throw new ApiError(400, 'Recipient and message body are required');
  }

  if (String(recipientId) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot send a message to yourself');
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new ApiError(404, 'Recipient not found');
  }

  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    property: propertyId || undefined,
    body,
  });

  const populated = await message.populate([
    { path: 'sender', select: 'fullName avatar' },
    { path: 'recipient', select: 'fullName avatar' },
  ]);

  res.status(201).json({ success: true, message: 'Message sent', data: populated });
});

// @desc    Get list of conversations (grouped by the other participant)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const messages = await Message.find({
    $or: [{ sender: userId }, { recipient: userId }],
  })
    .sort({ createdAt: -1 })
    .populate('sender', 'fullName avatar')
    .populate('recipient', 'fullName avatar');

  const conversationsMap = new Map();

  messages.forEach((msg) => {
    const otherUser = String(msg.sender._id) === String(userId) ? msg.recipient : msg.sender;
    const key = String(otherUser._id);

    if (!conversationsMap.has(key)) {
      conversationsMap.set(key, {
        user: otherUser,
        lastMessage: msg,
        unreadCount: 0,
      });
    }

    if (String(msg.recipient._id) === String(userId) && !msg.isRead) {
      conversationsMap.get(key).unreadCount += 1;
    }
  });

  res.status(200).json({ success: true, data: Array.from(conversationsMap.values()) });
});

// @desc    Get conversation thread with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getConversationWithUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const otherUserId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { sender: userId, recipient: otherUserId },
      { sender: otherUserId, recipient: userId },
    ],
  })
    .sort({ createdAt: 1 })
    .populate('sender', 'fullName avatar')
    .populate('recipient', 'fullName avatar');

  await Message.updateMany(
    { sender: otherUserId, recipient: userId, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({ success: true, data: messages });
});

module.exports = { sendMessage, getConversations, getConversationWithUser };
