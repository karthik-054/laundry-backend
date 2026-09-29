// const ServiceRequest = require("../models/ServiceRequest");
// const User = require("../models/Users");

// // ======================================
// // Get All Service Requests
// // ======================================

// exports.getServiceRequests = async (req, res) => {
//   try {
//     const requests = await ServiceRequest.find()
//       .populate(
//         "user",
//         "name email phone role isActive"
//       )
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: requests.length,
//       data: requests,
//     });
//   } catch (error) {
//     console.error(
//       "Get Service Requests Error:",
//       error
//     );

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // ======================================
// // Approve Service Request
// // ======================================

// exports.approveServiceRequest = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const serviceRequest =
//       await ServiceRequest.findById(id);

//     if (!serviceRequest) {
//       return res.status(404).json({
//         success: false,
//         message: "Service request not found",
//       });
//     }

//     if (serviceRequest.status === "approved") {
//       return res.status(400).json({
//         success: false,
//         message: "Service request is already approved",
//       });
//     }

//     serviceRequest.status = "approved";
//     serviceRequest.adminMessage =
//       "Your service request has been approved.";

//     await serviceRequest.save();

//     // Activate customer account
//     await User.findByIdAndUpdate(
//       serviceRequest.user,
//       {
//         isActive: true,
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message:
//         "Service request approved successfully",
//       data: serviceRequest,
//     });
//   } catch (error) {
//     console.error(
//       "Approve Service Request Error:",
//       error
//     );

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // ======================================
// // Reject Service Request
// // ======================================

// exports.rejectServiceRequest = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const serviceRequest =
//       await ServiceRequest.findById(id);

//     if (!serviceRequest) {
//       return res.status(404).json({
//         success: false,
//         message: "Service request not found",
//       });
//     }

//     serviceRequest.status = "rejected";
//     serviceRequest.adminMessage =
//       "Your service request has been rejected.";

//     await serviceRequest.save();

//     res.status(200).json({
//       success: true,
//       message:
//         "Service request rejected successfully",
//       data: serviceRequest,
//     });
//   } catch (error) {
//     console.error(
//       "Reject Service Request Error:",
//       error
//     );

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.createDeliveryPerson =
//   async (req, res) => {

//     try {

//       const {
//         name,
//         email,
//         phone,
//         password,
//       } = req.body;

//       if (
//         !name ||
//         !email ||
//         !phone ||
//         !password
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "All fields are required",
//         });
//       }

//       const existingUser =
//         await User.findOne({
//           email,
//         });

//       if (existingUser) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Email already exists",
//         });
//       }

//       const deliveryPerson =
//         await User.create({

//           name,

//           email,

//           phone,

//           password,

//           role:
//             "delivery",

//           isActive:
//             true,

//           busy:
//             false,

//         });

//       return res.status(201).json({

//         success: true,

//         message:
//           "Delivery person created successfully",

//         data:
//           deliveryPerson,

//       });

//     } catch (error) {

//       console.error(
//         "Create Delivery Person Error:",
//         error,
//       );

//       return res.status(500).json({

//         success: false,

//         message:
//           error.message,

//       });

//     }

//   };

//   exports.getReports = async (req, res) => {
//   try {
//     res.status(200).json({
//       success: true,
//       message: "Reports API working",
//       data: {
//         totalOrders: 0,
//         totalRevenue: 0,
//         pendingOrders: 0,
//         completedOrders: 0,
//       },
//     });
//   } catch (error) {
//     console.error("Get reports error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch reports",
//       error: error.message,
//     });
//   }
// };
const mongoose = require('mongoose')
const ServiceRequest = require('../models/ServiceRequest')
const User = require('../models/Users')
const Order = require('../models/Order')
const bcrypt = require('bcryptjs')
const Notification = require('../models/Notification')

// =====================================================
// GET ALL SERVICE REQUESTS
// GET /api/admin/service-requests
// =====================================================

exports.getServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find()
      .populate('user', 'name email phone role isActive')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    })
  } catch (error) {
    console.error('Get Service Requests Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
// =====================================================
// APPROVE SERVICE REQUEST
// PUT /api/admin/service-requests/:id/approve
// =====================================================

exports.approveServiceRequest = async (req, res) => {
  try {
    const { id } = req.params

    const serviceRequest = await ServiceRequest.findById(id)

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      })
    }

    if (serviceRequest.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Service request is already approved'
      })
    }

    serviceRequest.status = 'approved'

    serviceRequest.adminMessage = 'Your service request has been approved.'

    await serviceRequest.save()

    await User.findByIdAndUpdate(serviceRequest.user, {
      isActive: true
    })

    return res.status(200).json({
      success: true,
      message: 'Service request approved successfully',
      data: serviceRequest
    })
  } catch (error) {
    console.error('Approve Service Request Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// =====================================================
// REJECT SERVICE REQUEST
// PUT /api/admin/service-requests/:id/reject
// =====================================================

exports.rejectServiceRequest = async (req, res) => {
  try {
    const { id } = req.params

    const serviceRequest = await ServiceRequest.findById(id)

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      })
    }

    serviceRequest.status = 'rejected'

    serviceRequest.adminMessage = 'Your service request has been rejected.'

    await serviceRequest.save()

    return res.status(200).json({
      success: true,
      message: 'Service request rejected successfully',
      data: serviceRequest
    })
  } catch (error) {
    console.error('Reject Service Request Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// =====================================================
// CREATE DELIVERY PERSON
// POST /api/admin/delivery-users
// =====================================================

exports.createDeliveryPerson = async (req, res) => {
  try {
    let { name, email, phone, password } = req.body

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      })
    }

    // Normalize email
    email = email.trim().toLowerCase()

    // Check existing user
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create delivery person
    const deliveryPerson = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'delivery',
      isActive: true,
      busy: {
        type: Boolean,
        default: false
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Delivery person created successfully',
      data: {
        id: deliveryPerson._id,
        name: deliveryPerson.name,
        email: deliveryPerson.email,
        phone: deliveryPerson.phone,
        role: deliveryPerson.role,
        isActive: deliveryPerson.isActive
      }
    })
  } catch (error) {
    console.error('Create Delivery Person Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

exports.getDeliveryPersons = async (req, res) => {
  try {
    const deliveryPersons = await User.find({
      role: 'delivery'
    }).select('name email phone busy isActive')

    return res.status(200).json({
      success: true,
      count: deliveryPersons.length,
      data: deliveryPersons.map(person => ({
        id: person._id,
        name: person.name,
        email: person.email,
        phone: person.phone,
        busy: person.busy || false
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
// GET REPORTS
// GET /api/admin/reports
// =====================================================

exports.getReports = async (req, res) => {
  try {
    const [totalOrders, pendingOrders, completedOrders, revenueResult] =
      await Promise.all([
        Order.countDocuments(),

        Order.countDocuments({
          status: {
            $nin: ['DELIVERED', 'CANCELLED']
          }
        }),

        Order.countDocuments({
          status: 'DELIVERED'
        }),

        Order.aggregate([
          {
            $match: {
              status: {
                $ne: 'CANCELLED'
              }
            }
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: '$finalAmount'
              }
            }
          }
        ])
      ])

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders
      }
    })
  } catch (error) {
    console.error('Get Reports Error:', error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// =====================================================
// UPDATE ORDER STATUS
// PATCH /api/admin/orders/:id/status
// =====================================================

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    console.log('========== UPDATE ORDER STATUS ==========')
    console.log('ORDER ID:', id)
    console.log('NEW STATUS:', status)
    console.log('ADMIN ID:', req.user?.id)

    // ==========================================
    // VALID STATUSES
    // ==========================================

    const allowedStatuses = [
      'PROCESSING',
      'READY_FOR_DELIVERY'
    ]

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin order status'
      })
    }

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order = await Order.findById(id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    // ==========================================
    // VALIDATE STATUS FLOW
    // ==========================================

    if (
      status === 'PROCESSING' &&
      order.status !== 'PICKED_UP'
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Order must be PICKED_UP before processing. Current status: ${order.status}`
      })
    }

    if (
      status === 'READY_FOR_DELIVERY' &&
      order.status !== 'PROCESSING'
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Order must be PROCESSING before it can be ready for delivery. Current status: ${order.status}`
      })
    }

    // ==========================================
    // UPDATE STATUS
    // ==========================================

    order.status = status

    await order.save()

    console.log(
      'ORDER STATUS UPDATED:',
      order.orderNumber,
      status
    )

    // ==========================================
    // PROCESSING NOTIFICATION
    // ==========================================

    if (status === 'PROCESSING') {
      const notification = await Notification.create({
        user: order.customer,
        title: 'Order processing',
        body:
          `Your order ${order.orderNumber} is now being processed.`,
        type: 'ORDER',
        orderId: order._id,
        read: false
      })

      console.log(
        'PROCESSING NOTIFICATION CREATED:',
        notification._id
      )
    }

    // ==========================================
    // READY FOR DELIVERY NOTIFICATION
    // ==========================================

    if (status === 'READY_FOR_DELIVERY') {
      const notification = await Notification.create({
        user: order.customer,
        title: 'Order ready for delivery',
        body:
          `Your order ${order.orderNumber} is ready for delivery.`,
        type: 'DELIVERY',
        orderId: order._id,
        read: false
      })

      console.log(
        'READY NOTIFICATION CREATED:',
        notification._id
      )
    }

    // ==========================================
    // GET UPDATED ORDER
    // ==========================================

    const updatedOrder = await Order.findById(id)
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
        'service',
        'name'
      )

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message:
        `Order status updated to ${status}`,

      data: {
        ...updatedOrder.toObject(),

        id: updatedOrder._id.toString()
      }
    })

  } catch (error) {
    console.error(
      'Update Order Status Error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}