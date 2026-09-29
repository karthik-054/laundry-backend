// utils/createNotification.js

const Notification = require("../models/Notification");

const createNotification = async ({
  userId,
  title,
  body,
  type = "GENERAL",
  orderId = null,
}) => {
  if (!userId) {
    console.log("Notification skipped: no userId");
    return null;
  }

  try {
    return await Notification.create({
      user: userId,
      title,
      body,
      type,
      orderId,
      read: false,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};

module.exports = createNotification;