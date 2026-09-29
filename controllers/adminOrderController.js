const mongoose = require('mongoose')
const Order = require('../models/Order')
const User = require('../models/Users')
const Notification = require('../models/Notification')

// =====================================================
// GET ALL ADMIN ORDERS
// GET /api/admin/orders
// =====================================================

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phone address')
      .populate('pickupDeliveryUser', 'name email phone busy isActive')
      .populate('dropDeliveryUser', 'name email phone busy isActive')
      .populate('assignedBy', 'name email')
      .sort({
        createdAt: -1
      })

    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),

      orderNumber: order.orderNumber,

      customer: order.customer
        ? {
            id: order.customer._id.toString(),
            name: order.customer.name || 'Customer',
            email: order.customer.email,
            phone: order.customer.phone,
            address: order.customer.address
          }
        : null,

      serviceName: order.serviceName || 'Service',

      items: order.items || [],

      deliveryPreference: order.deliveryPreference,

      pickupAt: order.pickupAt,

      expectedDeliveryAt: order.expectedDeliveryAt,

      subtotal: order.subtotal || 0,

      finalAmount: order.finalAmount || 0,

      paymentMethod: order.paymentMethod || 'UNKNOWN',

      paymentStatus: order.paymentStatus || 'PENDING',

      status: order.status || 'UNKNOWN',

      pickupDeliveryUser: order.pickupDeliveryUser
        ? {
            id: order.pickupDeliveryUser._id.toString(),

            name: order.pickupDeliveryUser.name,

            phone: order.pickupDeliveryUser.phone,

            email: order.pickupDeliveryUser.email,

            busy: order.pickupDeliveryUser.busy || false,

            isActive: order.pickupDeliveryUser.isActive !== false
          }
        : null,

      dropDeliveryUser: order.dropDeliveryUser
        ? {
            id: order.dropDeliveryUser._id.toString(),

            name: order.dropDeliveryUser.name,

            phone: order.dropDeliveryUser.phone,

            email: order.dropDeliveryUser.email,

            busy: order.dropDeliveryUser.busy || false,

            isActive: order.dropDeliveryUser.isActive !== false
          }
        : null,

      assignedAt: order.assignedAt,

      assignedBy: order.assignedBy
        ? {
            id: order.assignedBy._id.toString(),

            name: order.assignedBy.name,

            email: order.assignedBy.email
          }
        : null,

      createdAt: order.createdAt,

      updatedAt: order.updatedAt
    }))

    return res.status(200).json({
      success: true,
      count: formattedOrders.length,
      data: formattedOrders
    })
  } catch (error) {
    console.error('Get All Orders Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// =====================================================
// GET SINGLE ADMIN ORDER
// GET /api/admin/orders/:id
// =====================================================

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      })
    }

    const order = await Order.findById(id)
      .populate('customer', 'name email phone address')
      .populate('pickupDeliveryUser', 'name email phone busy isActive')
      .populate('dropDeliveryUser', 'name email phone busy isActive')
      .populate('assignedBy', 'name email')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    const formattedOrder = {
      id: order._id.toString(),

      orderNumber: order.orderNumber,

      customer: order.customer
        ? {
            id: order.customer._id.toString(),

            name: order.customer.name || 'Customer',

            email: order.customer.email,

            phone: order.customer.phone,

            address: order.customer.address
          }
        : null,

      serviceName: order.serviceName || 'Service',

      items: order.items || [],

      deliveryPreference: order.deliveryPreference,

      pickupAt: order.pickupAt,

      expectedDeliveryAt: order.expectedDeliveryAt,

      subtotal: order.subtotal || 0,

      finalAmount: order.finalAmount || 0,

      paymentMethod: order.paymentMethod || 'UNKNOWN',

      paymentStatus: order.paymentStatus || 'PENDING',

      status: order.status || 'UNKNOWN',

      pickupDeliveryUser: order.pickupDeliveryUser
        ? {
            id: order.pickupDeliveryUser._id.toString(),

            name: order.pickupDeliveryUser.name,

            phone: order.pickupDeliveryUser.phone,

            email: order.pickupDeliveryUser.email,

            busy: order.pickupDeliveryUser.busy || false,

            isActive: order.pickupDeliveryUser.isActive !== false
          }
        : null,

      dropDeliveryUser: order.dropDeliveryUser
        ? {
            id: order.dropDeliveryUser._id.toString(),

            name: order.dropDeliveryUser.name,

            phone: order.dropDeliveryUser.phone,

            email: order.dropDeliveryUser.email,

            busy: order.dropDeliveryUser.busy || false,

            isActive: order.dropDeliveryUser.isActive !== false
          }
        : null,

      assignedAt: order.assignedAt,

      assignedBy: order.assignedBy
        ? {
            id: order.assignedBy._id.toString(),

            name: order.assignedBy.name,

            email: order.assignedBy.email
          }
        : null,

      createdAt: order.createdAt,

      updatedAt: order.updatedAt
    }

    return res.status(200).json({
      success: true,
      data: formattedOrder
    })
  } catch (error) {
    console.error('Get Admin Order Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// =====================================================
// GET DELIVERY PERSONS
// GET /api/admin/delivery-persons
// =====================================================

exports.getDeliveryPersons = async (req, res) => {
  try {
    const deliveryPersons = await User.find({
      role: 'delivery',
      isActive: true
    })
      .select('name email phone busy isActive')
      .sort({
        name: 1
      })

    return res.status(200).json({
      success: true,

      count: deliveryPersons.length,

      data: deliveryPersons.map(person => ({
        id: person._id.toString(),

        name: person.name,

        email: person.email,

        phone: person.phone,

        busy: person.busy || false,

        isActive: person.isActive !== false
      }))
    })
  } catch (error) {
    console.error('Get Delivery Persons Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// =====================================================
// ASSIGN DELIVERY PERSON
// PUT /api/admin/orders/:id/assign
// =====================================================

exports.assignDeliveryPerson = async (req, res) => {
  try {
    const { deliveryPersonId } = req.body
    const orderId = req.params.id

    console.log('========== ASSIGN DELIVERY ==========')
    console.log('ORDER ID:', orderId)
    console.log('DELIVERY PERSON ID:', deliveryPersonId)
    console.log('ADMIN ID:', req.user?.id)

    // ==========================================
    // VALIDATE DELIVERY PERSON
    // ==========================================

    if (!deliveryPersonId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery person is required'
      })
    }

    // ==========================================
    // FIND DELIVERY PERSON
    // ==========================================

    const deliveryUser = await User.findOne({
      _id: deliveryPersonId,
      role: 'delivery',
      isActive: true
    })

    if (!deliveryUser) {
      return res.status(404).json({
        success: false,
        message: 'Delivery person not found'
      })
    }

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    // ==========================================
    // ASSIGN DELIVERY PERSON
    // ==========================================

    order.pickupDeliveryUser = deliveryUser._id
    order.assignedAt = new Date()
    order.assignedBy = req.user.id
    order.status = 'PICKUP_ASSIGNED'

    await order.save()

    console.log('ORDER ASSIGNED:', order._id)
    console.log('CUSTOMER:', order.customer)
    console.log('DELIVERY PERSON:', deliveryUser._id)

    // ==========================================
    // CUSTOMER NOTIFICATION
    // ==========================================

    const customerNotification = await Notification.create({
      user: order.customer,
      title: 'Pickup assigned',
      body: `A delivery person has been assigned to pick up your order ${order.orderNumber}.`,
      type: 'DELIVERY',
      orderId: order._id,
      read: false
    })

    console.log(
      'CUSTOMER NOTIFICATION CREATED:',
      customerNotification._id
    )

    // ==========================================
    // DELIVERY PERSON NOTIFICATION
    // ==========================================

    const deliveryNotification = await Notification.create({
      user: deliveryUser._id,
      title: 'New pickup assigned',
      body: `You have been assigned to pick up order ${order.orderNumber}.`,
      type: 'DELIVERY',
      orderId: order._id,
      read: false
    })

    console.log(
      'DELIVERY NOTIFICATION CREATED:',
      deliveryNotification._id
    )

    // ==========================================
    // RETURN RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: 'Delivery person assigned successfully',

      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        deliveryUserId: deliveryUser._id,
        status: order.status
      }
    })

  } catch (error) {
    console.error(
      '========== ASSIGN DELIVERY ERROR =========='
    )

    console.error(error)
    console.error(error.stack)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}