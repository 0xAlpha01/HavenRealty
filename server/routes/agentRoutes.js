const express = require('express');
const { getAgents, getAgentById } = require('../controllers/agentController');

const router = express.Router();

router.get('/', getAgents);
router.get('/:id', getAgentById);

module.exports = router;
