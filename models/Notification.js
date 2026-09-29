const mongoose = require("mongoose");

const notificationSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      body: {
        type: String,
        required: true,
        trim: true,
      },

      type: {
        type: String,

        enum: [
          "ORDER",
          "PAYMENT",
          "DELIVERY",
          "WALLET",
          "COIN",
          "REVIEW",
          "CUSTOMER",
          "GENERAL",
        ],

        default: "GENERAL",
      },

      orderId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Order",

        default: null,
      },

      read: {
        type: Boolean,
        default: false,
      },
    },

    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Notification",
    notificationSchema
  );