const express = require("express");

const router = express.Router();

const {
  getInvoice,
} = require("../controllers/invoiceController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.get(
  "/:orderId",
  protect,
  getInvoice
);

module.exports = router;