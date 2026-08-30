const express = require('express');
const { submitContactMessage } = require('../controllers/contactController');

const router = express.Router();

router.post('/', submitContactMessage);

module.exports = router;
