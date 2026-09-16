const express = require("express");

const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  cancelOrder,
  quoteOrder,
  getMyAssignedOrders,
} = require("../controllers/orderController");

const {
  protect,
  deliveryOnly,
} = require("../middleware/authMiddleware");

// =====================================================
// CREATE ORDER
// POST /api/orders
// =====================================================

router.post(
  "/",
  protect,
  createOrder
);

// =====================================================
// GET MY ORDERS
// GET /api/orders/my-orders
// =====================================================

router.get(
  "/my-orders",
  protect,
  getMyOrders
);

// =====================================================
// QUOTE ORDER
// POST /api/orders/quote
// =====================================================

router.post(
  "/quote",
  protect,
  quoteOrder
);

// =====================================================
// TRACK ORDER
// GET /api/orders/:id/track
// =====================================================

router.get(
  "/:id/track",
  protect,
  trackOrder
);

// =====================================================
// GET SINGLE ORDER
// GET /api/orders/:id
// =====================================================

router.get(
  "/:id",
  protect,
  getOrderById
);


router.get(
  "/delivery/my-orders",
  protect,
  deliveryOnly,
  getMyAssignedOrders
);
// =====================================================
// CANCEL ORDER
// PUT /api/orders/:id/cancel
// =====================================================

router.put(
  "/:id/cancel",
  protect,
  cancelOrder
);

module.exports = router;