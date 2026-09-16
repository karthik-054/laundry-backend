const express = require("express");

const router = express.Router();

const {
  getMyCoins,
} = require("../controllers/coinController");

const { protect } = require("../middleware/authMiddleware");

// GET /api/coins
router.get(
  "/",
  protect,
  getMyCoins
);

module.exports = router;