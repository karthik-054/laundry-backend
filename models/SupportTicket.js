const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    category: {
      type: String,
      default: 'general',
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        'open',
        'in_progress',
        'resolved',
        'closed',
      ],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'SupportTicket',
  supportTicketSchema
);