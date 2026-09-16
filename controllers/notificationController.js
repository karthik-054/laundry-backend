const Notification =
  require("../models/Notification");


// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications =
      await Notification.find({
        user: req.user._id
      })
        .sort({
          createdAt: -1
        });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });

  } catch (error) {
    console.error("Get Notifications Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications"
    });
  }
};


// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const count =
      await Notification.countDocuments({
        user: req.user._id,
        isRead: false
      });

    res.status(200).json({
      success: true,
      unreadCount: count
    });

  } catch (error) {
    console.error(
      "Get Unread Count Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count"
    });
  }
};


// Mark one notification as read
exports.markNotificationAsRead =
  async (req, res) => {
    try {

      const notification =
        await Notification.findOne({
          _id: req.params.id,
          user: req.user._id
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found"
        });
      }

      notification.isRead = true;

      await notification.save();

      res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
        data: notification
      });

    } catch (error) {
      console.error(
        "Mark Notification Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update notification"
      });
    }
  };


// Mark all notifications as read
exports.markAllNotificationsAsRead =
  async (req, res) => {
    try {

      await Notification.updateMany(
        {
          user: req.user._id,
          isRead: false
        },
        {
          $set: {
            isRead: true
          }
        }
      );

      res.status(200).json({
        success: true,
        message:
          "All notifications marked as read"
      });

    } catch (error) {
      console.error(
        "Mark All Notifications Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update notifications"
      });
    }
  };