const mongoose = require('mongoose')

// =====================================================
// ORDER ITEM
// =====================================================

const orderItemSchema = new mongoose.Schema(
  {
    dressType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DressType',
      required: true
    },

    dressName: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },

    lineTotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    _id: false
  }
)

// =====================================================
// ORDER
// =====================================================

const orderSchema = new mongoose.Schema(
  {
    // ==========================================
    // CUSTOMER
    // ==========================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true
    },

    // ==========================================
    // SERVICE
    // ==========================================

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },

    serviceName: {
      type: String,
      required: true
    },

    // ==========================================
    // ITEMS
    // ==========================================

    items: {
      type: [orderItemSchema],

      required: true,

      validate: {
        validator: value => Array.isArray(value) && value.length > 0,

        message: 'At least one garment is required'
      }
    },

    // ==========================================
    // PICKUP / DELIVERY
    // ==========================================

    pickupAt: {
      type: Date,
      required: true
    },

    deliveryPreference: {
      type: String,

      enum: ['normal', 'quick'],

      default: 'normal'
    },

    expectedDeliveryAt: {
      type: Date,
      required: true
    },

    // ==========================================
    // PRICE
    // ==========================================

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    serviceCharge: {
      type: Number,
      default: 0,
      min: 0
    },

    quickDeliveryCharge: {
      type: Number,
      default: 0,
      min: 0
    },

    membershipDiscount: {
      type: Number,
      default: 0,
      min: 0
    },

    coinDiscount: {
      type: Number,
      default: 0,
      min: 0
    },

    coinsUsed: {
      type: Number,
      default: 0,
      min: 0
    },

    coinsEarned: {
      type: Number,
      default: 0,
      min: 0
    },

    finalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    deliveryAccepted: {
      type: Boolean,
      default: false
    },

    deliveryAcceptedAt: {
      type: Date,
      default: null
    },

    // ==========================================
    // DELIVERY ASSIGNMENT
    // ==========================================

    pickupDeliveryUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    dropDeliveryUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    assignedAt: {
      type: Date,
      default: null
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // ==========================================
    // PAYMENT
    // ==========================================

    paymentMethod: {
      type: String,

      enum: ['razorpay', 'wallet', 'cod', 'wallet_razorpay'],

      required: true
    },

    paymentStatus: {
      type: String,

      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'COD'],

      default: 'PENDING'
    },

    walletUsed: {
      type: Number,
      default: 0,
      min: 0
    },

    razorpayAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    // ==========================================
    // ORDER STATUS
    // ==========================================

    status: {
      type: String,

      enum: [
        'ORDER_CREATED',
        'ADMIN_CONFIRMED',
        'PICKUP_ASSIGNED',
        'OUT_FOR_PICKUP',
        'PICKED_UP',
        'PROCESSING',
        'READY_FOR_DELIVERY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED'
      ],

      default: 'ORDER_CREATED'
    },

    // ==========================================
    // ADDRESS
    // ==========================================

    pickupAddress: {
      type: String,
      default: ''
    },

    deliveryAddress: {
      type: String,
      default: ''
    },

    // ==========================================
    // CANCELLATION
    // ==========================================

    cancellationReason: {
      type: String,
      default: ''
    },

    cancelledAt: {
      type: Date,
      default: null
    }
  },

  {
    timestamps: true
  }
)

module.exports = mongoose.model('Order', orderSchema)
