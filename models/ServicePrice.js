const mongoose = require("mongoose");

const servicePriceSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    dressType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DressType",
      required: true,
    },

    deliveryPreference: {
      type: String,
      enum: ["normal", "quick"],
      required: true,
      default: "normal",
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Same service + same dress + same delivery type = only one price
servicePriceSchema.index(
  {
    service: 1,
    dressType: 1,
    deliveryPreference: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "ServicePrice",
  servicePriceSchema
);