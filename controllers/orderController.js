const Order = require('../models/Order')
const Service = require('../models/Service')
const DressType = require('../models/DressType')
const ServicePrice = require('../models/ServicePrice')
const Coin = require('../models/Coin')
const Wallet = require('../models/Wallet')
const WalletTransaction = require('../models/WalletTransaction')
const CoinTransaction = require('../models/CoinTransaction')

const QUICK_DELIVERY_CHARGE = 50
const SERVICE_CHARGE = 20
const COIN_VALUE = 1

const mongoose = require('mongoose')

// =====================================================
// CREATE ORDER
// =====================================================

exports.createOrder = async (req, res) => {
  try {
    const {
      serviceId,
      items,
      deliveryPreference = 'normal',
      coinsToRedeem = 0,
      pickupAt,
      paymentMethod,
      walletAmount
    } = req.body

    // -----------------------------
    // 1. Validation
    // -----------------------------

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Service is required'
      })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one garment is required'
      })
    }

    if (!pickupAt) {
      return res.status(400).json({
        success: false,
        message: 'Pickup time is required'
      })
    }

    if (!['normal', 'quick'].includes(deliveryPreference)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery preference'
      })
    }

    if (
      !['razorpay', 'wallet', 'cod', 'wallet_razorpay'].includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      })
    }

    // -----------------------------
    // 2. Pickup date
    // -----------------------------

    const pickupDate = new Date(pickupAt)

    if (isNaN(pickupDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup time'
      })
    }

    // -----------------------------
    // 3. Service
    // -----------------------------

    const service = await Service.findOne({
      _id: serviceId,
      isActive: true
    })

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      })
    }

    // -----------------------------
    // 4. Calculate items
    // -----------------------------

    let subtotal = 0
    const calculatedItems = []

    for (const item of items) {
      const { dressTypeId, quantity } = item

      if (!dressTypeId) {
        return res.status(400).json({
          success: false,
          message: 'Dress type is required'
        })
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be at least 1'
        })
      }

      const dressType = await DressType.findById(item.dressTypeId)

      if (!dressType) {
        return res.status(404).json({
          success: false,
          message: 'Dress type not found'
        })
      }

      const price = await ServicePrice.findOne({
        service: serviceId,
        dressType: dressTypeId,
        deliveryPreference,
        isActive: true
      })

      if (!price) {
        return res.status(400).json({
          success: false,
          message: `Price not found for ${dressType.name} under ${service.name}`
        })
      }

      if (
        !req.user ||
        !req.user.id ||
        !mongoose.Types.ObjectId.isValid(req.user.id)
      ) {
        return res.status(401).json({
          success: false,
          message: 'Invalid authenticated user'
        })
      }

      const lineTotal = price.unitPrice * quantity

      subtotal += lineTotal

      calculatedItems.push({
        dressType: dressType._id,
        dressName: dressType.name,
        quantity,
        unitPrice: price.unitPrice,
        lineTotal
      })
    }

    // -----------------------------
    // 5. Charges
    // -----------------------------

    const serviceCharge = SERVICE_CHARGE

    const quickDeliveryCharge =
      deliveryPreference === 'quick' ? QUICK_DELIVERY_CHARGE : 0

    // -----------------------------
    // 6. Membership
    // -----------------------------

    // Membership integration can be added later.
    const membershipDiscount = 0

    // -----------------------------
    // 7. Coins
    // -----------------------------

    const requestedCoins = Number(coinsToRedeem) || 0

    let validCoinsToRedeem = 0
    let coinDiscount = 0

    if (requestedCoins > 0) {
      const coinAccount = await Coin.findOne({
        user: req.user.id
      })

      const availableCoins = coinAccount?.balance || 0

      validCoinsToRedeem = Math.min(requestedCoins, availableCoins)

      coinDiscount = validCoinsToRedeem * COIN_VALUE
    }

    // -----------------------------
    // 8. Final amount
    // -----------------------------

    let finalAmount =
      subtotal +
      serviceCharge +
      quickDeliveryCharge -
      membershipDiscount -
      coinDiscount

    if (finalAmount < 0) {
      finalAmount = 0
    }

    // -----------------------------
    // 9. Expected delivery
    // -----------------------------

    const processingHours =
      deliveryPreference === 'quick'
        ? service.processingHoursQuick
        : service.processingHoursNormal

    const expectedDeliveryAt = new Date(pickupDate)

    expectedDeliveryAt.setHours(expectedDeliveryAt.getHours() + processingHours)

    // -----------------------------
    // 10. Coins earned
    // -----------------------------

    const coinsEarned = Math.floor(finalAmount / 100)

    // -----------------------------
    // 11. Payment
    // -----------------------------

    let walletUsed = 0
    let razorpayAmount = 0
    let paymentStatus = 'PENDING'

    if (paymentMethod === 'cod') {
      paymentStatus = 'COD'
    }

    if (paymentMethod === 'wallet') {
      walletUsed = finalAmount
      paymentStatus = 'PAID'
    }

    if (paymentMethod === 'razorpay') {
      razorpayAmount = finalAmount
      paymentStatus = 'PENDING'
    }

    if (paymentMethod === 'wallet_razorpay') {
      const requestedWalletAmount = Number(walletAmount) || 0

      if (requestedWalletAmount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid wallet amount'
        })
      }

      if (requestedWalletAmount > finalAmount) {
        return res.status(400).json({
          success: false,
          message: 'Wallet amount cannot be greater than order amount'
        })
      }

      walletUsed = requestedWalletAmount

      razorpayAmount = finalAmount - walletUsed

      paymentStatus = razorpayAmount > 0 ? 'PENDING' : 'PAID'
    }

    // -----------------------------
    // 12. Order number
    // -----------------------------

    const orderNumber = `ORD-${Date.now()}`

    // -----------------------------
    // 13. Create order
    // -----------------------------

    const order = await Order.create({
      customer: req.user.id,

      orderNumber,

      service: service._id,
      serviceName: service.name,

      items: calculatedItems,

      pickupAt: pickupDate,

      deliveryPreference,

      expectedDeliveryAt,

      subtotal,

      serviceCharge,

      quickDeliveryCharge,

      membershipDiscount,

      coinDiscount,

      coinsUsed: validCoinsToRedeem,

      coinsEarned,

      finalAmount,

      paymentMethod,

      paymentStatus,

      walletUsed,

      razorpayAmount,

      status: 'ORDER_CREATED'
    })

    // -----------------------------
    // 14. Response
    // -----------------------------

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',

      data: {
        id: order._id.toString(),

        orderNumber: order.orderNumber,

        customerId: order.customer.toString(),

        serviceId: order.service.toString(),

        serviceName: order.serviceName,

        items: order.items.map(item => ({
          dressTypeId: item.dressType.toString(),

          dressName: item.dressName,

          quantity: item.quantity,

          unitPrice: item.unitPrice,

          lineTotal: item.lineTotal
        })),

        pickupAt: order.pickupAt,

        deliveryPreference: order.deliveryPreference,

        expectedDeliveryAt: order.expectedDeliveryAt,

        subtotal: order.subtotal,

        serviceCharge: order.serviceCharge,

        quickDeliveryCharge: order.quickDeliveryCharge,

        membershipDiscount: order.membershipDiscount,

        coinDiscount: order.coinDiscount,

        coinsUsed: order.coinsUsed,

        coinsEarned: order.coinsEarned,

        finalAmount: order.finalAmount,

        paymentMethod: order.paymentMethod,

        paymentStatus: order.paymentStatus,

        walletUsed: order.walletUsed,

        razorpayAmount: order.razorpayAmount,

        status: order.status,

        createdAt: order.createdAt,

        updatedAt: order.updatedAt
      }
    })
  } catch (error) {
    console.error('Create Order Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//get my assign orders for delivery person

exports.getMyAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        {
          pickupDeliveryUser: req.user.id
        },
        {
          dropDeliveryUser: req.user.id
        }
      ]
    })
      .populate('customer', 'name email phone address')
      .populate('pickupDeliveryUser', 'name email phone')
      .populate('dropDeliveryUser', 'name email phone')
      .sort({
        createdAt: -1
      })

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    })
  } catch (error) {
    console.error('Get Assigned Orders Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// =====================================================
// QUOTE ORDER
// =====================================================

exports.quoteOrder = async (req, res) => {
  try {
    const {
      serviceId,
      items,
      deliveryPreference,
      coinsToRedeem = 0,
      pickupAt
    } = req.body

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Service is required'
      })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one garment is required'
      })
    }

    if (!['normal', 'quick'].includes(deliveryPreference)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery preference'
      })
    }

    if (!pickupAt) {
      return res.status(400).json({
        success: false,
        message: 'Pickup time is required'
      })
    }

    // -----------------------------
    // FIND SERVICE
    // -----------------------------

    const service = await Service.findOne({
      _id: serviceId,
      isActive: true
    })

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      })
    }

    // -----------------------------
    // CALCULATE ITEMS
    // -----------------------------

    let subtotal = 0

    const calculatedItems = []

    for (const item of items) {
      if (
        !item.dressTypeId ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid garment quantity'
        })
      }

      // IMPORTANT:
      // Your existing DressType documents don't have isActive
      const dressType = await DressType.findById(item.dressTypeId)

      if (!dressType) {
        return res.status(404).json({
          success: false,
          message: `Dress type not found: ${item.dressTypeId}`
        })
      }

      // Find price for:
      // Service + DressType + Normal/Quick
      const price = await ServicePrice.findOne({
        service: serviceId,
        dressType: item.dressTypeId,
        deliveryPreference: deliveryPreference,
        isActive: true
      })

      if (!price) {
        return res.status(404).json({
          success: false,
          message: `Price not found for ${service.name} + ${dressType.name} + ${deliveryPreference}`
        })
      }

      const quantity = Number(item.quantity)

      const lineTotal = price.unitPrice * quantity

      subtotal += lineTotal

      calculatedItems.push({
        dressTypeId: dressType._id.toString(),
        dressName: dressType.name,
        quantity,
        unitPrice: price.unitPrice,
        lineTotal
      })
    }

    // -----------------------------
    // CHARGES
    // -----------------------------

    const serviceCharge = 20

    const quickDeliveryCharge = deliveryPreference === 'quick' ? 50 : 0

    const membershipDiscount = 0

    // -----------------------------
    // COINS
    // -----------------------------

    let validCoinsToRedeem = 0
    let coinDiscount = 0

    if (Number(coinsToRedeem) > 0) {
      const coinAccount = await Coin.findOne({
        user: req.user.id
      })

      const availableCoins = coinAccount?.balance || 0

      validCoinsToRedeem = Math.min(Number(coinsToRedeem), availableCoins)

      coinDiscount = validCoinsToRedeem
    }

    // -----------------------------
    // FINAL AMOUNT
    // -----------------------------

    let finalAmount =
      subtotal +
      serviceCharge +
      quickDeliveryCharge -
      membershipDiscount -
      coinDiscount

    if (finalAmount < 0) {
      finalAmount = 0
    }

    // -----------------------------
    // EXPECTED DELIVERY
    // -----------------------------

    const pickupDate = new Date(pickupAt)

    if (isNaN(pickupDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup time'
      })
    }

    const expectedDeliveryAt = new Date(pickupDate)

    const processingHours =
      deliveryPreference === 'quick'
        ? service.processingHoursQuick
        : service.processingHoursNormal

    expectedDeliveryAt.setHours(expectedDeliveryAt.getHours() + processingHours)

    // -----------------------------
    // COINS EARNED
    // -----------------------------

    const coinsEarned = Math.floor(finalAmount / 100)

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.status(200).json({
      success: true,

      service: {
        id: service._id.toString(),
        name: service.name
      },

      items: calculatedItems,

      subtotal,

      serviceCharge,

      quickDeliveryCharge,

      membershipDiscount,

      coinsToRedeem: validCoinsToRedeem,

      coinDiscount,

      finalAmount,

      expectedDeliveryAt,

      coinsEarned
    })
  } catch (error) {
    console.error('Quote Order Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// =====================================================
// GET MY ORDERS
// =====================================================

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user.id
    })
      .populate('service')
      .sort({ createdAt: -1 })

    const data = orders.map(order => ({
      id: order._id.toString(),

      orderNumber: order.orderNumber,

      customerId: order.customer.toString(),

      serviceId: order.service._id.toString(),

      serviceName: order.serviceName,

      items: order.items.map(item => ({
        dressTypeId: item.dressType.toString(),

        dressName: item.dressName,

        quantity: item.quantity,

        unitPrice: item.unitPrice,

        lineTotal: item.lineTotal
      })),

      pickupAt: order.pickupAt,

      deliveryPreference: order.deliveryPreference,

      expectedDeliveryAt: order.expectedDeliveryAt,

      subtotal: order.subtotal,

      serviceCharge: order.serviceCharge,

      quickDeliveryCharge: order.quickDeliveryCharge,

      membershipDiscount: order.membershipDiscount,

      coinDiscount: order.coinDiscount,

      coinsUsed: order.coinsUsed,

      coinsEarned: order.coinsEarned,

      finalAmount: order.finalAmount,

      paymentMethod: order.paymentMethod,

      paymentStatus: order.paymentStatus,

      walletUsed: order.walletUsed,

      razorpayAmount: order.razorpayAmount,

      status: order.status,

      createdAt: order.createdAt,

      updatedAt: order.updatedAt
    }))

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    console.error('Get My Orders Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// =====================================================
// GET SINGLE ORDER
// =====================================================

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.id
    })
      .populate('service')
      .populate('customer', 'name email phone')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    const data = {
      id: order._id.toString(),

      orderNumber: order.orderNumber,

      customerId: order.customer._id.toString(),

      serviceId: order.service._id.toString(),

      serviceName: order.serviceName,

      items: order.items.map(item => ({
        dressTypeId: item.dressType.toString(),

        dressName: item.dressName,

        quantity: item.quantity,

        unitPrice: item.unitPrice,

        lineTotal: item.lineTotal
      })),

      pickupAt: order.pickupAt,

      deliveryPreference: order.deliveryPreference,

      expectedDeliveryAt: order.expectedDeliveryAt,

      subtotal: order.subtotal,

      serviceCharge: order.serviceCharge,

      quickDeliveryCharge: order.quickDeliveryCharge,

      membershipDiscount: order.membershipDiscount,

      coinDiscount: order.coinDiscount,

      coinsUsed: order.coinsUsed,

      coinsEarned: order.coinsEarned,

      finalAmount: order.finalAmount,

      paymentMethod: order.paymentMethod,

      paymentStatus: order.paymentStatus,

      walletUsed: order.walletUsed,

      razorpayAmount: order.razorpayAmount,

      status: order.status,

      createdAt: order.createdAt,

      updatedAt: order.updatedAt
    }

    return res.status(200).json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Get Order Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// =====================================================
// TRACK ORDER
// =====================================================

exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.id
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    return res.status(200).json({
      success: true,

      data: {
        id: order._id.toString(),

        orderNumber: order.orderNumber,

        status: order.status,

        pickupAt: order.pickupAt,

        expectedDeliveryAt: order.expectedDeliveryAt,

        deliveryPreference: order.deliveryPreference
      }
    })
  } catch (error) {
    console.error('Track Order Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// =====================================================
// CANCEL ORDER
// =====================================================

exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body

    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.id
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    if (!['ORDER_CREATED', 'ADMIN_CONFIRMED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'This order cannot be cancelled now'
      })
    }

    order.status = 'CANCELLED'

    order.cancellationReason = reason || 'Cancelled by customer'

    order.cancelledAt = new Date()

    await order.save()

    return res.status(200).json({
      success: true,

      message: 'Order cancelled successfully',

      data: {
        id: order._id.toString(),

        orderNumber: order.orderNumber,

        status: order.status,

        cancellationReason: order.cancellationReason,

        cancelledAt: order.cancelledAt
      }
    })
  } catch (error) {
    console.error('Cancel Order Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
