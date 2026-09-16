const mongoose = require("mongoose");

const coinTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    coin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coin",
      required: true,
    },

    type: {
      type: String,
      enum: ["EARN", "REDEEM"],
      required: true,
    },

    coins: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "CoinTransaction",
  coinTransactionSchema
);