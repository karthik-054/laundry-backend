const express = require("express");

const router = express.Router();

const {
  getMyWallet,
  addMoney,
  debitMoney,
} = require("../controllers/walletController");

const { protect } = require("../middleware/authMiddleware");

// =====================================================
// GET MY WALLET
// GET /api/wallet
// =====================================================
router.get("/", protect, getMyWallet);

// =====================================================
// ADD MONEY
// POST /api/wallet/add
// =====================================================
router.post("/add", protect, addMoney);

// =====================================================
// DEBIT MONEY
// POST /api/wallet/debit
// =====================================================
router.post("/debit", protect, debitMoney);

module.exports = router;