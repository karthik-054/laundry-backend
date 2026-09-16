const express = require('express')

const router = express.Router()

const {
  getDashboard,
  getPickups,
  getHistory,
  getActiveDeliveries,
  updateOrderStatus,
  acceptDelivery
} = require('../controllers/deliveryController')

const { protect, deliveryOnly } = require('../middleware/authMiddleware')

router.get('/dashboard', protect, deliveryOnly, getDashboard)

router.get('/pickups', protect, deliveryOnly, getPickups)

router.get('/history', protect, deliveryOnly, getHistory)

router.patch(
  '/orders/:orderId/status',
  protect,
  deliveryOnly,
  updateOrderStatus
)

router.patch(
  '/orders/:orderId/accept',
  protect,
  deliveryOnly,
  acceptDelivery
);

router.get('/orders/active', protect, deliveryOnly, getActiveDeliveries)

module.exports = router
