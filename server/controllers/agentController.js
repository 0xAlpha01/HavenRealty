const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Get all agents (users who own at least one approved property, or flagged as agent)
// @route   GET /api/agents
// @access  Public
const getAgents = asyncHandler(async (req, res) => {
  const propertyOwnerIds = await Property.distinct('owner', { status: 'approved' });

  const agents = await User.find({
    $or: [{ isAgent: true }, { role: 'agent' }, { _id: { $in: propertyOwnerIds } }],
    isActive: true,
  }).select('fullName email phone avatar bio location createdAt');

  const agentsWithCounts = await Promise.all(
    agents.map(async (agent) => {
      const propertiesCount = await Property.countDocuments({ owner: agent._id, status: 'approved' });
      return { ...agent.toObject(), propertiesCount };
    })
  );

  res.status(200).json({ success: true, data: agentsWithCounts });
});

// @desc    Get a single agent's profile with their properties
// @route   GET /api/agents/:id
// @access  Public
const getAgentById = asyncHandler(async (req, res) => {
  const agent = await User.findById(req.params.id).select(
    'fullName email phone avatar bio location createdAt'
  );

  if (!agent) {
    throw new ApiError(404, 'Agent not found');
  }

  const properties = await Property.find({ owner: agent._id, status: 'approved' }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { agent, properties } });
});

module.exports = { getAgents, getAgentById };
