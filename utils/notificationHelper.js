const Notification = require("../models/Notification");

/**
 * Create one notification
 */
const createNotification = async ({
  userId,
  title,
  body,
  type = "GENERAL",
  orderId = null,
  relatedUserId = null,
}) => {
  try {
    if (!userId) {
      console.log("Notification skipped: userId missing");
      return null;
    }

    const notification = await Notification.create({
      user: userId,
      title,
      body,
      type,
      orderId,
      relatedUserId,
      read: false,
    });

    return notification;
  } catch (error) {
    console.error(
      "Create notification error:",
      error
    );

    // Notification failure should not break
    // the main order/user/payment operation.
    return null;
  }
};

/**
 * Create notifications for multiple users
 */
const createNotifications = async ({
  userIds = [],
  title,
  body,
  type = "GENERAL",
  orderId = null,
  relatedUserId = null,
}) => {
  try {
    const uniqueUserIds = [
      ...new Set(
        userIds
          .filter(Boolean)
          .map(id => id.toString())
      ),
    ];

    if (uniqueUserIds.length === 0) {
      return [];
    }

    const notifications = uniqueUserIds.map(
      userId => ({
        user: userId,
        title,
        body,
        type,
        orderId,
        relatedUserId,
        read: false,
      })
    );

    return await Notification.insertMany(
      notifications
    );
  } catch (error) {
    console.error(
      "Create multiple notifications error:",
      error
    );

    return [];
  }
};

/**
 * Notify all admin users
 */
const notifyAdmins = async ({
  title,
  body,
  type = "GENERAL",
  orderId = null,
  relatedUserId = null,
}) => {
  try {
    const User = require("../models/User");

    const admins = await User.find({
      role: "admin",
      isActive: true,
    }).select("_id");

    const adminIds = admins.map(
      admin => admin._id
    );

    return await createNotifications({
      userIds: adminIds,
      title,
      body,
      type,
      orderId,
      relatedUserId,
    });
  } catch (error) {
    console.error(
      "Notify admins error:",
      error
    );

    return [];
  }
};

/**
 * Notify all delivery persons
 *
 * We will normally use this only when we need
 * to notify every active delivery person.
 */
const notifyDeliveryPersons = async ({
  title,
  body,
  type = "DELIVERY",
  orderId = null,
  relatedUserId = null,
}) => {
  try {
    const User = require("../models/User");

    const deliveryUsers = await User.find({
      role: "delivery",
      isActive: true,
    }).select("_id");

    const deliveryIds = deliveryUsers.map(
      user => user._id
    );

    return await createNotifications({
      userIds: deliveryIds,
      title,
      body,
      type,
      orderId,
      relatedUserId,
    });
  } catch (error) {
    console.error(
      "Notify delivery persons error:",
      error
    );

    return [];
  }
};

module.exports = {
  createNotification,
  createNotifications,
  notifyAdmins,
  notifyDeliveryPersons,
};