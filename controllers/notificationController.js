const Notification = require("../models/Notification");

// =====================================================
// CREATE NOTIFICATION
// =====================================================

const createNotification = async ({
  userId,
  title,
  body,
  type = "GENERAL",
  orderId = null,
}) => {
  try {
    if (!userId) {
      console.error(
        "Create notification error: userId is missing"
      );

      return null;
    }

    const notification =
      await Notification.create({
        user: userId,
        title,
        body,
        type,
        orderId,
      });

    console.log(
      "Notification created:",
      notification._id
    );

    return notification;
  } catch (error) {
    console.error(
      "Create notification error:",
      error
    );

    return null;
  }
};

// =====================================================
// NOTIFY ADMINS
// =====================================================

const notifyAdmins = async ({
  title,
  body,
  type = "GENERAL",
  orderId = null,
}) => {
  try {
    const User = require("../models/Users");

    const admins = await User.find({
      role: "admin",
      isActive: true,
    }).select("_id");

    if (!admins.length) {
      console.log(
        "No active admins found"
      );

      return [];
    }

    const notifications =
      await Notification.insertMany(
        admins.map(admin => ({
          user: admin._id,
          title,
          body,
          type,
          orderId,
        }))
      );

    console.log(
      `Admin notifications created: ${notifications.length}`
    );

    return notifications;
  } catch (error) {
    console.error(
      "Notify admins error:",
      error
    );

    return [];
  }
};

// =====================================================
// GET ALL NOTIFICATIONS
// GET /api/notifications
// =====================================================

const getNotifications = async (
  req,
  res
) => {
  try {
    console.log(
      "NOTIFICATION USER:",
      req.user?.id
    );

    console.log(
      "NOTIFICATION ROLE:",
      req.user?.role
    );

    const notifications =
      await Notification.find({
        user: req.user.id,
      })
        .sort({
          createdAt: -1,
        })
        .limit(100);

    console.log(
      "FOUND NOTIFICATIONS:",
      notifications.length
    );

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get notifications",
    });
  }
};

// =====================================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// =====================================================

const getUnreadCount = async (
  req,
  res
) => {
  try {
    const count =
      await Notification.countDocuments({
        user: req.user.id,
        read: false,
      });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(
      "Unread notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get unread count",
    });
  }
};

// =====================================================
// MARK SINGLE NOTIFICATION AS READ
// PUT /api/notifications/:id/read
// =====================================================

const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user.id,
        },
        {
          $set: {
            read: true,
          },
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error(
      "Mark notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark notification",
    });
  }
};

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PUT /api/notifications/read-all
// =====================================================

const markAllNotificationsAsRead =
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          user: req.user.id,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read",
      });
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to mark notifications",
      });
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createNotification,
  notifyAdmins,
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};