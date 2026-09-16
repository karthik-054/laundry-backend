const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');


// ========================================
// GET REVIEW FOR MY ORDER
// ========================================
exports.getMyOrderReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userId =
      req.user.id ||
      req.user.userId ||
      req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token',
      });
    }

    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check that this order belongs to the logged-in customer.
    const orderCustomerId =
      order.customer ||
      order.user ||
      order.customerId;

    if (
      !orderCustomerId ||
      orderCustomerId.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot access this order review',
      });
    }

    const review = await Review.findOne({
      order: orderId,
      customer: userId,
    });

    return res.status(200).json({
      success: true,
      data: review
        ? {
            id: review._id.toString(),
            orderId: review.order.toString(),
            customerId: review.customer.toString(),
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
          }
        : null,
    });
  } catch (error) {
    console.error('GET REVIEW ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================================
// CREATE REVIEW
// ========================================
exports.createReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userId =
      req.user.id ||
      req.user.userId ||
      req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token',
      });
    }

    const {
      orderId,
      rating,
      comment = '',
    } = req.body;

    // ========================================
    // VALIDATE ORDER ID
    // ========================================
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    // ========================================
    // VALIDATE RATING
    // ========================================
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // ========================================
    // FIND ORDER
    // ========================================
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // ========================================
    // CHECK ORDER OWNER
    // ========================================
    const orderCustomerId =
      order.customer ||
      order.user ||
      order.customerId;

    if (
      !orderCustomerId ||
      orderCustomerId.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own order',
      });
    }

    // ========================================
    // ONLY DELIVERED ORDERS CAN BE REVIEWED
    // ========================================
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'You can review an order only after it is delivered',
      });
    }

    // ========================================
    // CHECK EXISTING REVIEW
    // ========================================
    const existingReview = await Review.findOne({
      order: orderId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this order',
      });
    }

    // ========================================
    // CREATE REVIEW
    // ========================================
    const review = await Review.create({
      order: orderId,
      customer: userId,
      rating: numericRating,
      comment: String(comment).trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        id: review._id.toString(),
        orderId: review.order.toString(),
        customerId: review.customer.toString(),
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    });
  } catch (error) {
    console.error('CREATE REVIEW ERROR:', error);

    // Handle MongoDB duplicate review
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this order',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('customer', 'name email phone')
      .populate('order', 'orderNumber serviceName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews.map(review => ({
        id: review._id,

        rating: review.rating,

        comment: review.comment,

        createdAt: review.createdAt,

        customer: review.customer
          ? {
              id: review.customer._id,
              name: review.customer.name,
              email: review.customer.email,
              phone: review.customer.phone,
            }
          : null,

        order: review.order
          ? {
              id: review.order._id,
              orderNumber: review.order.orderNumber,
              serviceName: review.order.serviceName,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('Get Admin Reviews Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};