const mongoose = require("mongoose");

const advertisementSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true
      },

      description: {
        type: String
      },

      image: {
        type: String,
        required: true
      },

      redirectType: {
        type: String,

        enum: [
          "SERVICE",
          "ORDER",
          "OFFER",
          "NONE"
        ],

        default: "NONE"
      },

      redirectId: {
        type: String
      },

      isActive: {
        type: Boolean,
        default: true
      }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model(
  "Advertisement",
  advertisementSchema
);