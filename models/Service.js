const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: ['basic', 'premium'],
      default: 'basic'
    },

    isPopular: {
      type: Boolean,
      default: false
    },

    description: {
      type: String,
      default: ''
    },

    image: {
      type: String,
      default: ''
    },

    processingHoursNormal: {
      type: Number,
      required: true,
      default: 48
    },

    processingHoursQuick: {
      type: Number,
      required: true,
      default: 24
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Service', serviceSchema)
