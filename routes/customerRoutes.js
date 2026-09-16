const express = require("express");

const router = express.Router();

const {
  getCustomerDashboard
} = require("../controllers/customerController");

const {
  protect
} = require("../middleware/authMiddleware");

router.get(
  "/dashboard",
  protect,
  getCustomerDashboard
);

module.exports = router;