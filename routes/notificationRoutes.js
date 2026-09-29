const express = require("express");

const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require(
  "../controllers/notificationController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

// GET ALL
router.get(
  "/",
  protect,
  getNotifications
);

// UNREAD COUNT
router.get(
  "/unread-count",
  protect,
  getUnreadCount
);

// READ ALL
router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

// READ ONE
router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);

module.exports = router;