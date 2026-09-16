const express = require('express');

const router = express.Router();

const {
  getMyTickets,
  createTicket,
} = require('../controllers/supportController');

const { protect } = require('../middleware/authMiddleware');

router.get('/tickets', protect, getMyTickets);

router.post('/tickets', protect, createTicket);

module.exports = router;