const express = require("express");

const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require(
  "../controllers/notificationController"
);

const {
  protect
} = require(
  "../middleware/authMiddleware"
);


// Get all notifications
router.get(
  "/",
  protect,
  getNotifications
);


// Get unread notification count
router.get(
  "/unread-count",
  protect,
  getUnreadCount
);


// Mark all notifications as read
router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);


// Mark single notification as read
router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);


module.exports = router;