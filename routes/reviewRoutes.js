const express = require('express');

const router = express.Router();

const {
  getMyOrderReview,
  createReview,
  getAdminReviews,
} = require('../controllers/reviewController');

const { protect,authorize } = require('../middleware/authMiddleware');


// GET review for one order
router.get(
  '/order/:orderId',
  protect,
  getMyOrderReview
);


// CREATE review
router.post(
  '/',
  protect,
  createReview
);

router.get(
  '/admin',
  protect,
  authorize('admin'),
  getAdminReviews
);


module.exports = router;