// const express = require('express')

// const router = express.Router()

// const {
//   getDashboard,
//   getPickups,
//   getHistory,
//   getActiveDeliveries,
//   updateOrderStatus,
//   acceptDelivery
// } = require('../controllers/deliveryController')

// const { protect, deliveryOnly } = require('../middleware/authMiddleware')

// router.get('/dashboard', protect, deliveryOnly, getDashboard)

// router.get('/pickups', protect, deliveryOnly, getPickups)

// router.get('/history', protect, deliveryOnly, getHistory)

// router.patch(
//   '/orders/:orderId/status',
//   protect,
//   deliveryOnly,
//   updateOrderStatus
// )

// router.patch(
//   '/orders/:orderId/accept',
//   protect,
//   deliveryOnly,
//   acceptDelivery
// );

// router.get('/orders/active', protect, deliveryOnly, getActiveDeliveries)

// module.exports = router


const express = require('express')

const router = express.Router()

const {
  getDashboard,
  getPickups,
  getHistory,
  getActiveDeliveries,
  updateDeliveryOrderStatus,
  acceptDelivery
} = require('../controllers/deliveryController')

const {
  protect,
  deliveryOnly
} = require('../middleware/authMiddleware')

// Dashboard
router.get(
  '/dashboard',
  protect,
  deliveryOnly,
  getDashboard
)

// Pickups
router.get(
  '/pickups',
  protect,
  deliveryOnly,
  getPickups
)

// History
router.get(
  '/history',
  protect,
  deliveryOnly,
  getHistory
)

// Update order status
router.patch(
  '/orders/:orderId/status',
  protect,
  deliveryOnly,
  updateDeliveryOrderStatus
)

// Accept delivery
router.patch(
  '/orders/:orderId/accept',
  protect,
  deliveryOnly,
  acceptDelivery
)

// Active deliveries
router.get(
  '/orders/active',
  protect,
  deliveryOnly,
  getActiveDeliveries
)

module.exports = router