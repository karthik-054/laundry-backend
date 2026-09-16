const express = require("express");

const router = express.Router();

const {
  createServiceRequest,
  getMyServiceRequest,
} = require("../controllers/serviceRequestController");

const { protect } = require("../middleware/authMiddleware");

// Get customer's latest service request
router.get(
  "/",
  protect,
  getMyServiceRequest
);

// Submit customer service request
router.post(
  "/",
  protect,
  createServiceRequest
);

module.exports = router;