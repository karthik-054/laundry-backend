const Order = require('../models/Order');

const getUserId = req =>
  req.user?.id ||
  req.user?.userId ||
  req.user?._id;

exports.getDashboard = async (req, res) => {
  try {
    const userId = getUserId(req);

    console.log('\n========== DELIVERY DASHBOARD ==========');
    console.log('req.user:', req.user);
    console.log('Using userId:', userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const assignedFilter = {
      $or: [
        { deliveryAgent: userId },
        { pickupDeliveryUser: userId },
        { dropDeliveryUser: userId },
      ],
    };

    const activeOrders = await Order.find({
      ...assignedFilter,

      status: {
        $in: [
          'PICKUP_ASSIGNED',
          'OUT_FOR_PICKUP',
          'PICKED_UP',
          'PROCESSING',
          'READY_FOR_DELIVERY',
          'OUT_FOR_DELIVERY',
        ],
      },
    })
      .populate('customer', 'name phone email')
      .populate('service', 'name')
      .sort({ createdAt: -1 });

    const pickups = await Order.countDocuments({
      ...assignedFilter,

      status: {
        $in: [
          'PICKUP_ASSIGNED',
          'OUT_FOR_PICKUP',
          // 'PICKED_UP',
        ],
      },
    });

    const deliveries = await Order.countDocuments({
      ...assignedFilter,

      status: {
        $in: [
          'READY_FOR_DELIVERY',
          'OUT_FOR_DELIVERY',
        ],
      },
    });

    const completed = await Order.countDocuments({
      ...assignedFilter,

      status: 'DELIVERED',
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCompleted =
      await Order.countDocuments({
        ...assignedFilter,

        status: 'DELIVERED',

        updatedAt: {
          $gte: today,
          $lt: tomorrow,
        },
      });

    console.log(
      'Active orders:',
      activeOrders.map(order => ({
        id: order._id,
        deliveryAgent: order.deliveryAgent,
        pickupDeliveryUser:
          order.pickupDeliveryUser,
        dropDeliveryUser:
          order.dropDeliveryUser,
        status: order.status,
      }))
    );

    console.log(
      'Stats:',
      {
        pickups,
        deliveries,
        completed,
        todayCompleted,
      }
    );

    console.log('========================================\n');

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          pickups,
          deliveries,
          completed,
          todayCompleted,
        },
        activeOrders,
      },
    });

  } catch (error) {
    console.error(
      'Delivery Dashboard Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPickups = async (req, res) => {
  try {
    const userId = getUserId(req);

    console.log('\n========== DELIVERY PICKUPS ==========');
    console.log('req.user:', req.user);
    console.log('Using userId:', userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const pickups = await Order.find({
      $or: [
        { deliveryAgent: userId },
        { pickupDeliveryUser: userId },
      ],

      status: {
        $in: [
          'PICKUP_ASSIGNED',
          'OUT_FOR_PICKUP',
          'PICKED_UP',
        ],
      },
    })
      .populate('customer', 'name phone email')
      .populate('service', 'name')
      .sort({ pickupAt: 1 });

    console.log(
      'Found pickups:',
      pickups.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        deliveryAgent: order.deliveryAgent,
        pickupDeliveryUser:
          order.pickupDeliveryUser,
        status: order.status,
      }))
    );

    console.log('======================================\n');

    return res.status(200).json({
      success: true,
      count: pickups.length,
      data: pickups,
    });

  } catch (error) {
    console.error(
      'Delivery Pickups Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const history = await Order.find({
      deliveryAgent: userId,
      status: {
        $in: [
          'DELIVERED',
          'CANCELLED',
        ],
      },
    })
      .populate('customer')
      .populate('service')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error('Delivery History Error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { orderId } = req.params;
    const { status } = req.body;

    console.log('\n========== UPDATE DELIVERY STATUS ==========');
    console.log('Order ID:', orderId);
    console.log('Requested Status:', status);
    console.log('req.user:', req.user);
    console.log('Using userId:', userId);
    console.log('============================================');

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const allowedStatuses = [
      'OUT_FOR_PICKUP',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery status',
      });
    }

    const order = await Order.findOne({
      _id: orderId,

      $or: [
        { deliveryAgent: userId },
        { pickupDeliveryUser: userId },
        { dropDeliveryUser: userId },
      ],
    });

    if (!order) {
      console.log(
        '❌ ORDER NOT FOUND FOR DELIVERY USER'
      );

      // Very useful debugging
      const existingOrder =
        await Order.findById(orderId);

      console.log(
        'Existing order:',
        existingOrder
          ? {
              id: existingOrder._id,
              deliveryAgent:
                existingOrder.deliveryAgent,
              pickupDeliveryUser:
                existingOrder.pickupDeliveryUser,
              dropDeliveryUser:
                existingOrder.dropDeliveryUser,
              status:
                existingOrder.status,
            }
          : 'ORDER DOES NOT EXIST'
      );

      return res.status(404).json({
        success: false,
        message: 'Assigned order not found',
      });
    }

    // ==========================================
    // VALID STATUS TRANSITIONS
    // ==========================================

    const currentStatus = order.status;

    const validTransitions = {
      PICKUP_ASSIGNED: [
        'OUT_FOR_PICKUP',
      ],

      OUT_FOR_PICKUP: [
        'PICKED_UP',
      ],

      READY_FOR_DELIVERY: [
        'OUT_FOR_DELIVERY',
      ],

      OUT_FOR_DELIVERY: [
        'DELIVERED',
      ],
    };

    const allowedNextStatuses =
      validTransitions[currentStatus] || [];

    if (
      !allowedNextStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot change status from ${currentStatus} to ${status}`,
      });
    }

    order.status = status;

    await order.save();

    console.log(
      '✅ STATUS UPDATED:',
      order._id,
      currentStatus,
      '→',
      status
    );

    return res.status(200).json({
      success: true,
      message:
        'Order status updated successfully',
      data: order,
    });

  } catch (error) {
    console.error(
      'Update Delivery Status Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.assignDeliveryAgent = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryAgentId } = req.body;

    console.log('\n========== ASSIGN DELIVERY ==========');
    console.log('Order ID:', orderId);
    console.log('Delivery Person ID:', deliveryAgentId);
    console.log('Logged User:', req.user);
    console.log('=====================================');

    if (!orderId || !deliveryAgentId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and delivery person ID are required',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Assign rider
    order.deliveryAgent = deliveryAgentId;

    // Pickup rider
    order.pickupDeliveryUser = deliveryAgentId;

    // Assignment information
    order.assignedAt = new Date();

    order.assignedBy =
      req.user?.id ||
      req.user?.userId ||
      req.user?._id;

    // Assignment status
    order.status = 'PICKUP_ASSIGNED';

    await order.save();

    const updatedOrder = await Order.findById(orderId);

    console.log('\n========== ASSIGNMENT SAVED ==========');
    console.log('Order:', updatedOrder?._id);
    console.log(
      'deliveryAgent:',
      updatedOrder?.deliveryAgent
    );
    console.log(
      'pickupDeliveryUser:',
      updatedOrder?.pickupDeliveryUser
    );
    console.log(
      'assignedBy:',
      updatedOrder?.assignedBy
    );
    console.log(
      'status:',
      updatedOrder?.status
    );
    console.log('======================================\n');

    return res.status(200).json({
      success: true,
      message: 'Delivery rider assigned successfully',
      data: updatedOrder,
    });

  } catch (error) {
    console.error(
      'Assign Delivery Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getActiveDeliveries = async (req, res) => {
  try {
    const userId = getUserId(req);

    console.log('\n========== ACTIVE DELIVERIES ==========');
    console.log('Using userId:', userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const deliveries = await Order.find({
      $or: [
        { deliveryAgent: userId },
        { pickupDeliveryUser: userId },
        { dropDeliveryUser: userId },
      ],

      status: {
        $in: [
          'PICKUP_ASSIGNED',
          'OUT_FOR_PICKUP',
          'PICKED_UP',
          'READY_FOR_DELIVERY',
          'OUT_FOR_DELIVERY',
        ],
      },
    })
      .populate('customer', 'name phone email')
      .populate('service', 'name')
      .sort({ createdAt: -1 });

    console.log(
      'Found active deliveries:',
      deliveries.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        deliveryAgent: order.deliveryAgent,
        pickupDeliveryUser:
          order.pickupDeliveryUser,
        dropDeliveryUser:
          order.dropDeliveryUser,
        deliveryAccepted:
          order.deliveryAccepted,
      }))
    );

    console.log('========================================\n');

    return res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries,
    });
  } catch (error) {
    console.error(
      'Active Deliveries Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.acceptDelivery = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { orderId } = req.params;

    console.log('\n========== ACCEPT DELIVERY ==========');
    console.log('Order ID:', orderId);
    console.log('Delivery User:', userId);
    console.log('=====================================');

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const order = await Order.findOne({
      _id: orderId,

      $or: [
        { deliveryAgent: userId },
        { pickupDeliveryUser: userId },
      ],

      status: 'PICKUP_ASSIGNED',
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          'Assigned pickup order not found or already accepted.',
      });
    }

    if (order.deliveryAccepted) {
      return res.status(400).json({
        success: false,
        message: 'This delivery has already been accepted.',
      });
    }

    order.deliveryAccepted = true;
    order.deliveryAcceptedAt = new Date();

    await order.save();

    console.log('✅ DELIVERY ACCEPTED');
    console.log('Order:', order._id);
    console.log('Accepted By:', userId);
    console.log('Accepted At:', order.deliveryAcceptedAt);
    console.log('=====================================\n');

    return res.status(200).json({
      success: true,
      message: 'Delivery accepted successfully',
      data: order,
    });
  } catch (error) {
    console.error('Accept Delivery Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};