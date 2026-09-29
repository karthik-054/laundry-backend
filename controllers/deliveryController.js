const Order = require('../models/Order')
const { notifyAdmins } = require('../controllers/notificationController')
const createNotification = require('../utils/createNotification')
const getUserId = req => req.user?.id || req.user?.userId || req.user?._id

exports.getDashboard = async (req, res) => {
  try {
    const userId = getUserId(req)

    console.log('\n========== DELIVERY DASHBOARD ==========')
    console.log('req.user:', req.user)
    console.log('Using userId:', userId)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const assignedFilter = {
      $or: [
        { deliveryAgent: userId },
        { pickupDeliveryUser: userId },
        { dropDeliveryUser: userId }
      ]
    }

    const activeOrders = await Order.find({
      ...assignedFilter,

      status: {
        $in: [
          'PICKUP_ASSIGNED',
          'OUT_FOR_PICKUP',
          'PICKED_UP',
          'PROCESSING',
          'READY_FOR_DELIVERY',
          'OUT_FOR_DELIVERY'
        ]
      }
    })
      .populate('customer', 'name phone email')
      .populate('service', 'name')
      .sort({ createdAt: -1 })

    const pickups = await Order.countDocuments({
      ...assignedFilter,

      status: {
        $in: [
          'PICKUP_ASSIGNED',
          'OUT_FOR_PICKUP'
          // 'PICKED_UP',
        ]
      }
    })

    const deliveries = await Order.countDocuments({
      ...assignedFilter,

      status: {
        $in: ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY']
      }
    })

    const completed = await Order.countDocuments({
      ...assignedFilter,

      status: 'DELIVERED'
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayCompleted = await Order.countDocuments({
      ...assignedFilter,

      status: 'DELIVERED',

      updatedAt: {
        $gte: today,
        $lt: tomorrow
      }
    })

    console.log(
      'Active orders:',
      activeOrders.map(order => ({
        id: order._id,
        deliveryAgent: order.deliveryAgent,
        pickupDeliveryUser: order.pickupDeliveryUser,
        dropDeliveryUser: order.dropDeliveryUser,
        status: order.status
      }))
    )

    console.log('Stats:', {
      pickups,
      deliveries,
      completed,
      todayCompleted
    })

    console.log('========================================\n')

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          pickups,
          deliveries,
          completed,
          todayCompleted
        },
        activeOrders
      }
    })
  } catch (error) {
    console.error('Delivery Dashboard Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
exports.updateDeliveryOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params
    const { status } = req.body

    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?._id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    const allowedStatuses = [
      'OUT_FOR_PICKUP',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED'
    ]

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery status'
      })
    }

    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    // =====================================================
    // CHECK DELIVERY PERSON
    // =====================================================

    const assignedDeliveryUser =
      order.pickupDeliveryUser ||
      order.dropDeliveryUser ||
      order.deliveryAgent

    if (
      !assignedDeliveryUser ||
      assignedDeliveryUser.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not assigned to this order'
      })
    }

    // =====================================================
    // STATUS FLOW
    // =====================================================

    const currentStatus = order.status

    if (
      status === 'OUT_FOR_PICKUP' &&
      currentStatus !== 'PICKUP_ASSIGNED'
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Order must be PICKUP_ASSIGNED before pickup. Current status: ${currentStatus}`
      })
    }

    if (
      status === 'PICKED_UP' &&
      currentStatus !== 'OUT_FOR_PICKUP'
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Order must be OUT_FOR_PICKUP before pickup completion. Current status: ${currentStatus}`
      })
    }

    if (
      status === 'OUT_FOR_DELIVERY' &&
      currentStatus !== 'READY_FOR_DELIVERY'
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Order must be READY_FOR_DELIVERY before delivery. Current status: ${currentStatus}`
      })
    }

    if (
      status === 'DELIVERED' &&
      currentStatus !== 'OUT_FOR_DELIVERY'
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Order must be OUT_FOR_DELIVERY before delivery completion. Current status: ${currentStatus}`
      })
    }

    // =====================================================
    // UPDATE ORDER
    // =====================================================

    order.status = status

    if (status === 'OUT_FOR_DELIVERY') {
      order.deliveryAgent = userId
    }

    await order.save()

    console.log(
      'STATUS UPDATED:',
      order.orderNumber,
      currentStatus,
      '→',
      status
    )

    // =====================================================
    // CUSTOMER NOTIFICATION
    // =====================================================

    let notificationTitle = ''
    let notificationBody = ''

    switch (status) {
      case 'OUT_FOR_PICKUP':
        notificationTitle = 'Pickup started'
        notificationBody =
          `Your order ${order.orderNumber} is now out for pickup.`
        break

      case 'PICKED_UP':
        notificationTitle = 'Order picked up'
        notificationBody =
          `Your order ${order.orderNumber} has been picked up.`
        break

      case 'OUT_FOR_DELIVERY':
        notificationTitle = 'Out for delivery'
        notificationBody =
          `Your order ${order.orderNumber} is now out for delivery.`
        break

      case 'DELIVERED':
        notificationTitle = 'Order delivered'
        notificationBody =
          `Your order ${order.orderNumber} has been delivered successfully.`
        break
    }

    if (notificationTitle) {
      await createNotification({
        userId: order.customer,
        title: notificationTitle,
        body: notificationBody,
        type: 'DELIVERY',
        orderId: order._id
      })
    }

    // =====================================================
    // ADMIN NOTIFICATION
    // =====================================================

    try {
      let adminTitle = ''
      let adminBody = ''

      switch (status) {
        case 'OUT_FOR_PICKUP':
          adminTitle = 'Pickup Started'
          adminBody =
            `Delivery person has started pickup for order ${order.orderNumber}.`
          break

        case 'PICKED_UP':
          adminTitle = 'Order Picked Up'
          adminBody =
            `Order ${order.orderNumber} has been picked up by the delivery person.`
          break

        case 'OUT_FOR_DELIVERY':
          adminTitle = 'Out for Delivery'
          adminBody =
            `Order ${order.orderNumber} is now out for delivery.`
          break

        case 'DELIVERED':
          adminTitle = 'Order Delivered'
          adminBody =
            `Order ${order.orderNumber} has been delivered successfully.`
          break
      }

      if (adminTitle) {
        await notifyAdmins({
          title: adminTitle,
          body: adminBody,
          type: 'DELIVERY',
          orderId: order._id
        })

        console.log(
          'ADMIN NOTIFICATION CREATED:',
          adminTitle,
          order.orderNumber
        )
      }
    } catch (notificationError) {
      console.error(
        'Admin delivery notification error:',
        notificationError
      )
    }

    // =====================================================
    // GET UPDATED ORDER
    // =====================================================

    const updatedOrder =
      await Order.findById(orderId)
        .populate(
          'customer',
          'name email phone'
        )
        .populate(
          'pickupDeliveryUser',
          'name email phone role'
        )
        .populate(
          'dropDeliveryUser',
          'name email phone role'
        )
        .populate(
          'deliveryAgent',
          'name email phone role'
        )

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      message:
        `Order status updated to ${status}`,
      data: updatedOrder
    })

  } catch (error) {
    console.error(
      'Update delivery status error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// =====================================================
// ASSIGN DELIVERY PERSON
// =====================================================

exports.assignDeliveryPerson = async (req, res) => {
  try {
    const { orderId } = req.params

    const {
      deliveryPersonId
    } = req.body

    const adminId =
      req.user?.id ||
      req.user?.userId ||
      req.user?._id

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!deliveryPersonId) {
      return res.status(400).json({
        success: false,
        message:
          'deliveryPersonId is required'
      })
    }

    const order =
      await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          'Order not found'
      })
    }

    // =====================================================
    // FIND DELIVERY USER
    // =====================================================

    const deliveryPerson =
      await User.findOne({
        _id: deliveryPersonId,
        role: 'delivery',
        isActive: true
      })

    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message:
          'Active delivery person not found'
      })
    }

    // =====================================================
    // ASSIGN
    // =====================================================

    order.pickupDeliveryUser =
      deliveryPerson._id

    order.deliveryAgent =
      deliveryPerson._id

    order.assignedAt =
      new Date()

    order.assignedBy =
      adminId || null

    order.status =
      'PICKUP_ASSIGNED'

    await order.save()

    // =====================================================
    // CUSTOMER NOTIFICATION
    // =====================================================

    await createNotification({
      userId: order.customer,

      title:
        'Delivery Person Assigned',

      body:
        `A delivery person has been assigned to your order ${order.orderNumber}.`,

      type:
        'DELIVERY',

      orderId:
        order._id
    })

    // =====================================================
    // DELIVERY PERSON NOTIFICATION
    // =====================================================

    await createNotification({
      userId:
        deliveryPerson._id,

      title:
        'New Pickup Assigned',

      body:
        `Order ${order.orderNumber} has been assigned to you for pickup.`,

      type:
        'DELIVERY',

      orderId:
        order._id
    })

    // =====================================================
    // ADMIN NOTIFICATION
    // =====================================================

    try {
      await notifyAdmins({
        title:
          'Delivery Person Assigned',

        body:
          `Delivery person ${deliveryPerson.name} has been assigned to order ${order.orderNumber}.`,

        type:
          'DELIVERY',

        orderId:
          order._id
      })

      console.log(
        'ADMIN ASSIGNMENT NOTIFICATION CREATED:',
        order.orderNumber
      )
    } catch (notificationError) {
      console.error(
        'Admin assignment notification error:',
        notificationError
      )
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    const updatedOrder =
      await Order.findById(orderId)
        .populate(
          'customer',
          'name email phone'
        )
        .populate(
          'pickupDeliveryUser',
          'name email phone role'
        )
        .populate(
          'deliveryAgent',
          'name email phone role'
        )

    return res.status(200).json({
      success: true,

      message:
        'Delivery person assigned successfully',

      data:
        updatedOrder
    })

  } catch (error) {
    console.error(
      'Assign delivery person error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        error.message
    })
  }
}


// =====================================================
// ACCEPT DELIVERY
// =====================================================

exports.acceptDelivery = async (req, res) => {
  try {
    const { orderId } = req.params

    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?._id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required'
      })
    }

    const order =
      await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          'Order not found'
      })
    }

    // =====================================================
    // CHECK ASSIGNMENT
    // =====================================================

    const assignedUser =
      order.pickupDeliveryUser ||
      order.deliveryAgent

    if (
      !assignedUser ||
      assignedUser.toString() !==
        userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not assigned to this order'
      })
    }

    // =====================================================
    // CHECK STATUS
    // =====================================================

    if (
      order.status !==
      'PICKUP_ASSIGNED'
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Order cannot be accepted from status ${order.status}`
      })
    }

    // =====================================================
    // ACCEPT
    // =====================================================

    order.deliveryAccepted =
      true

    order.deliveryAcceptedAt =
      new Date()

    await order.save()

    // =====================================================
    // CUSTOMER NOTIFICATION
    // =====================================================

    await createNotification({
      userId:
        order.customer,

      title:
        'Delivery Accepted',

      body:
        `The delivery person has accepted your order ${order.orderNumber}.`,

      type:
        'DELIVERY',

      orderId:
        order._id
    })

    // =====================================================
    // ADMIN NOTIFICATION
    // =====================================================

    try {
      await notifyAdmins({
        title:
          'Delivery Accepted',

        body:
          `Delivery person has accepted order ${order.orderNumber}.`,

        type:
          'DELIVERY',

        orderId:
          order._id
      })

      console.log(
        'ADMIN ACCEPTANCE NOTIFICATION CREATED:',
        order.orderNumber
      )
    } catch (notificationError) {
      console.error(
        'Admin acceptance notification error:',
        notificationError
      )
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      message:
        'Delivery accepted successfully',

      data:
        order
    })

  } catch (error) {
    console.error(
      'Accept delivery error:',
      error
    )

    return res.status(500).json({
      success: false,
      message:
        error.message
    })
  }
}

exports.getPickups = async (req, res) => {
  try {
    const userId = getUserId(req)

    console.log('\n========== DELIVERY PICKUPS ==========')
    console.log('req.user:', req.user)
    console.log('Using userId:', userId)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const pickups = await Order.find({
      $or: [{ deliveryAgent: userId }, { pickupDeliveryUser: userId }],

      status: {
        $in: ['PICKUP_ASSIGNED', 'OUT_FOR_PICKUP', 'PICKED_UP']
      }
    })
      .populate('customer', 'name phone email')
      .populate('service', 'name')
      .sort({ pickupAt: 1 })

    console.log(
      'Found pickups:',
      pickups.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        deliveryAgent: order.deliveryAgent,
        pickupDeliveryUser: order.pickupDeliveryUser,
        status: order.status
      }))
    )

    console.log('======================================\n')

    return res.status(200).json({
      success: true,
      count: pickups.length,
      data: pickups
    })
  } catch (error) {
    console.error('Delivery Pickups Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

exports.getHistory = async (req, res) => {
  try {
    const userId = getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const history = await Order.find({
      deliveryAgent: userId,
      status: {
        $in: ['DELIVERED', 'CANCELLED']
      }
    })
      .populate('customer')
      .populate('service')
      .sort({ updatedAt: -1 })

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    })
  } catch (error) {
    console.error('Delivery History Error:', error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

exports.updateOrderStatus = async (req, res) => {
  try {
    const userId = getUserId(req)
    const { orderId } = req.params
    const { status } = req.body

    console.log('\n========== UPDATE DELIVERY STATUS ==========')
    console.log('Order ID:', orderId)
    console.log('Requested Status:', status)
    console.log('req.user:', req.user)
    console.log('Using userId:', userId)
    console.log('============================================')

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const allowedStatuses = [
      'OUT_FOR_PICKUP',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED'
    ]

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery status'
      })
    }

    const order = await Order.findOne({
      _id: orderId,

      $or: [
        { deliveryAgent: userId },
        { pickupDeliveryUser: userId },
        { dropDeliveryUser: userId }
      ]
    })

    if (!order) {
      console.log('❌ ORDER NOT FOUND FOR DELIVERY USER')

      // Very useful debugging
      const existingOrder = await Order.findById(orderId)

      console.log(
        'Existing order:',
        existingOrder
          ? {
              id: existingOrder._id,
              deliveryAgent: existingOrder.deliveryAgent,
              pickupDeliveryUser: existingOrder.pickupDeliveryUser,
              dropDeliveryUser: existingOrder.dropDeliveryUser,
              status: existingOrder.status
            }
          : 'ORDER DOES NOT EXIST'
      )

      return res.status(404).json({
        success: false,
        message: 'Assigned order not found'
      })
    }

    // ==========================================
    // VALID STATUS TRANSITIONS
    // ==========================================

    const currentStatus = order.status

    const validTransitions = {
      PICKUP_ASSIGNED: ['OUT_FOR_PICKUP'],

      OUT_FOR_PICKUP: ['PICKED_UP'],

      READY_FOR_DELIVERY: ['OUT_FOR_DELIVERY'],

      OUT_FOR_DELIVERY: ['DELIVERED']
    }

    const allowedNextStatuses = validTransitions[currentStatus] || []

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${currentStatus} to ${status}`
      })
    }

    order.status = status

    await order.save()

    let notificationTitle = ''
    let notificationBody = ''

    switch (status) {
      case 'OUT_FOR_PICKUP':
        notificationTitle = 'Pickup Started'
        notificationBody = `Your order ${
          order.orderNumber || order._id
        } is now out for pickup.`
        break

      case 'PICKED_UP':
        notificationTitle = 'Order Picked Up'
        notificationBody = `Your order ${
          order.orderNumber || order._id
        } has been picked up and is being processed.`
        break

      case 'OUT_FOR_DELIVERY':
        notificationTitle = 'Out for Delivery'
        notificationBody = `Your order ${
          order.orderNumber || order._id
        } is on the way to you.`
        break

      case 'DELIVERED':
        notificationTitle = 'Order Delivered'
        notificationBody = `Your order ${
          order.orderNumber || order._id
        } has been delivered successfully.`
        break
      case 'PROCESSING':
        notificationTitle = 'Order Processing'
        notificationBody = `Your order ${
          order.orderNumber || order._id
        } is currently being processed.`
        break
    }

    if (notificationTitle) {
      await createNotification({
        userId: order.customer,
        title: notificationTitle,
        body: notificationBody,
        type: 'DELIVERY',
        orderId: order._id
      })
    }
    console.log('✅ STATUS UPDATED:', order._id, currentStatus, '→', status)

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    })
  } catch (error) {
    console.error('Update Delivery Status Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

exports.assignDeliveryAgent = async (req, res) => {
  try {
    const { orderId } = req.params
    const { deliveryAgentId } = req.body

    console.log('\n========== ASSIGN DELIVERY ==========')
    console.log('Order ID:', orderId)
    console.log('Delivery Person ID:', deliveryAgentId)
    console.log('Logged User:', req.user)
    console.log('=====================================')

    if (!orderId || !deliveryAgentId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and delivery person ID are required'
      })
    }

    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    // Assign rider
    order.deliveryAgent = deliveryAgentId

    // Pickup rider
    order.pickupDeliveryUser = deliveryAgentId

    // Assignment information
    order.assignedAt = new Date()

    order.assignedBy = req.user?.id || req.user?.userId || req.user?._id

    // Assignment status
    order.status = 'PICKUP_ASSIGNED'

    await order.save()

    // Notify delivery person
    await createNotification({
      userId: deliveryAgentId,
      title: 'New Delivery Assignment',
      body: `Order ${
        order.orderNumber || order._id
      } has been assigned to you for pickup.`,
      type: 'DELIVERY',
      orderId: order._id
    })

    // Notify customer
    await createNotification({
      userId: order.customer,
      title: 'Delivery Person Assigned',
      body: `A delivery person has been assigned to your order ${
        order.orderNumber || order._id
      }.`,
      type: 'DELIVERY',
      orderId: order._id
    })

    const updatedOrder = await Order.findById(orderId)

    console.log('\n========== ASSIGNMENT SAVED ==========')
    console.log('Order:', updatedOrder?._id)
    console.log('deliveryAgent:', updatedOrder?.deliveryAgent)
    console.log('pickupDeliveryUser:', updatedOrder?.pickupDeliveryUser)
    console.log('assignedBy:', updatedOrder?.assignedBy)
    console.log('status:', updatedOrder?.status)
    console.log('======================================\n')

    return res.status(200).json({
      success: true,
      message: 'Delivery rider assigned successfully',
      data: updatedOrder
    })
  } catch (error) {
    console.error('Assign Delivery Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

exports.getActiveDeliveries = async (req, res) => {
  try {
    const userId = getUserId(req)

    console.log('\n========== ACTIVE DELIVERIES ==========')
    console.log('Using userId:', userId)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const deliveries = await Order.find({
      $or: [
        { deliveryAgent: userId },
        { pickupDeliveryUser: userId },
        { dropDeliveryUser: userId }
      ],

      status: {
        $in: [
          'PICKUP_ASSIGNED',
          'OUT_FOR_PICKUP',
          'PICKED_UP',
          'READY_FOR_DELIVERY',
          'OUT_FOR_DELIVERY'
        ]
      }
    })
      .populate('customer', 'name phone email')
      .populate('service', 'name')
      .sort({ createdAt: -1 })

    console.log(
      'Found active deliveries:',
      deliveries.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        deliveryAgent: order.deliveryAgent,
        pickupDeliveryUser: order.pickupDeliveryUser,
        dropDeliveryUser: order.dropDeliveryUser,
        deliveryAccepted: order.deliveryAccepted
      }))
    )

    console.log('========================================\n')

    return res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries
    })
  } catch (error) {
    console.error('Active Deliveries Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

exports.acceptDelivery = async (req, res) => {
  try {
    const userId = getUserId(req)
    const { orderId } = req.params

    console.log('\n========== ACCEPT DELIVERY ==========')
    console.log('Order ID:', orderId)
    console.log('Delivery User:', userId)
    console.log('=====================================')

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const order = await Order.findOne({
      _id: orderId,

      $or: [{ deliveryAgent: userId }, { pickupDeliveryUser: userId }],

      status: 'PICKUP_ASSIGNED'
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Assigned pickup order not found or already accepted.'
      })
    }

    if (order.deliveryAccepted) {
      return res.status(400).json({
        success: false,
        message: 'This delivery has already been accepted.'
      })
    }

    order.deliveryAccepted = true
    order.deliveryAcceptedAt = new Date()

    await order.save()

    console.log('✅ DELIVERY ACCEPTED')
    console.log('Order:', order._id)
    console.log('Accepted By:', userId)
    console.log('Accepted At:', order.deliveryAcceptedAt)
    console.log('=====================================\n')

    return res.status(200).json({
      success: true,
      message: 'Delivery accepted successfully',
      data: order
    })
  } catch (error) {
    console.error('Accept Delivery Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
