const express = require("express");

const router = express.Router();

const {
  getCoinTransactions,
  earnCoins,
  redeemCoins,
} = require("../controllers/coinTransactionController");

const { protect } = require("../middleware/authMiddleware");

// GET /api/coin-transactions
router.get(
  "/",
  protect,
  getCoinTransactions
);

// POST /api/coin-transactions/earn
router.post(
  "/earn",
  protect,
  earnCoins
);

// POST /api/coin-transactions/redeem
router.post(
  "/redeem",
  protect,
  redeemCoins
);

module.exports = router;