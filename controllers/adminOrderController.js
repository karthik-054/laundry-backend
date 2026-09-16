// const Order = require("../models/Order");
// const User = require("../models/Users");

// // =====================================================
// // GET ALL ORDERS
// // GET /api/admin/orders
// // =====================================================

// exports.getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate(
//         "customer",
//         "name email phone address"
//       )
//       .populate(
//         "pickupDeliveryUser",
//         "name email phone"
//       )
//       .populate(
//         "dropDeliveryUser",
//         "name email phone"
//       )
//       .populate(
//         "assignedBy",
//         "name email"
//       )
//       .sort({
//         createdAt: -1,
//       });

//     const formattedOrders = orders.map(order => ({
//       id: order._id.toString(),

//       orderNumber: order.orderNumber,

//       customer: order.customer
//         ? {
//             id: order.customer._id.toString(),
//             name: order.customer.name,
//             email: order.customer.email,
//             phone: order.customer.phone,
//             address: order.customer.address,
//           }
//         : null,

//       serviceName: order.serviceName,

//       items: order.items,

//       deliveryPreference:
//         order.deliveryPreference,

//       pickupAt: order.pickupAt,

//       expectedDeliveryAt:
//         order.expectedDeliveryAt,

//       finalAmount: order.finalAmount,

//       paymentMethod:
//         order.paymentMethod,

//       paymentStatus:
//         order.paymentStatus,

//       status: order.status,

//       pickupDeliveryUser:
//         order.pickupDeliveryUser
//           ? {
//               id:
//                 order.pickupDeliveryUser._id.toString(),
//               name:
//                 order.pickupDeliveryUser.name,
//               phone:
//                 order.pickupDeliveryUser.phone,
//               email:
//                 order.pickupDeliveryUser.email,
//             }
//           : null,

//       dropDeliveryUser:
//         order.dropDeliveryUser
//           ? {
//               id:
//                 order.dropDeliveryUser._id.toString(),
//               name:
//                 order.dropDeliveryUser.name,
//               phone:
//                 order.dropDeliveryUser.phone,
//               email:
//                 order.dropDeliveryUser.email,
//             }
//           : null,

//       assignedAt:
//         order.assignedAt,

//       assignedBy:
//         order.assignedBy
//           ? {
//               id:
//                 order.assignedBy._id.toString(),
//               name:
//                 order.assignedBy.name,
//               email:
//                 order.assignedBy.email,
//             }
//           : null,

//       createdAt:
//         order.createdAt,
//     }));

//     return res.status(200).json({
//       success: true,
//       count: formattedOrders.length,
//       data: formattedOrders,
//     });

//   } catch (error) {
//     console.error(
//       "Get All Orders Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// // =====================================================
// // GET SINGLE ORDER
// // GET /api/admin/orders/:id
// // =====================================================

// exports.getOrderById = async (
//   req,
//   res
// ) => {
//   try {
//     const order =
//       await Order.findById(
//         req.params.id
//       )
//         .populate(
//           "customer",
//           "name email phone address"
//         )
//         .populate(
//           "pickupDeliveryUser",
//           "name email phone"
//         )
//         .populate(
//           "dropDeliveryUser",
//           "name email phone"
//         )
//         .populate(
//           "assignedBy",
//           "name email"
//         );

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: order,
//     });

//   } catch (error) {
//     console.error(
//       "Get Order Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// // =====================================================
// // GET DELIVERY PERSONS
// // GET /api/admin/delivery-persons
// // =====================================================

// exports.getDeliveryPersons =
//   async (req, res) => {
//     try {
//       const deliveryPersons =
//         await User.find({
//           role: "delivery",
//           isActive: true,
//         }).select(
//           "name email phone busy"
//         );

//       return res.status(200).json({
//         success: true,
//         count:
//           deliveryPersons.length,

//         data:
//           deliveryPersons.map(
//             person => ({
//               id:
//                 person._id.toString(),

//               name:
//                 person.name,

//               email:
//                 person.email,

//               phone:
//                 person.phone,

//               busy:
//                 person.busy || false,
//             })
//           ),
//       });

//     } catch (error) {
//       console.error(
//         "Get Delivery Persons Error:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   };


// // =====================================================
// // ASSIGN DELIVERY PERSON
// // PUT /api/admin/orders/:id/assign
// // =====================================================

// exports.assignDeliveryPerson = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { deliveryPersonId } = req.body;

//     console.log("========== ASSIGN DELIVERY ==========");
//     console.log("Order ID:", id);
//     console.log("Request Body:", req.body);
//     console.log("Logged User:", req.user);
//     console.log("=====================================");

//     // ======================================
//     // VALIDATE DELIVERY PERSON ID
//     // ======================================

//     if (!deliveryPersonId) {
//       return res.status(400).json({
//         success: false,
//         message: "deliveryPersonId is required",
//       });
//     }

//     // ======================================
//     // FIND DELIVERY PERSON
//     // ======================================

//     const deliveryPerson = await User.findOne({
//       _id: deliveryPersonId,
//       role: "delivery",
//       isActive: true,
//     });

//     if (!deliveryPerson) {
//       return res.status(404).json({
//         success: false,
//         message: "Delivery person not found or inactive",
//       });
//     }

//     // ======================================
//     // ASSIGN DELIVERY PERSON
//     // ======================================

//     const updatedOrder = await Order.findByIdAndUpdate(
//       id,
//       {
//         $set: {
//           pickupDeliveryUser: deliveryPerson._id,
//           assignedAt: new Date(),
//           assignedBy: req.user.id,
//           status: "PICKUP_ASSIGNED",
//         },
//       },
//       {
//         new: true,
//         runValidators: false,
//       }
//     )
//       .populate(
//         "customer",
//         "name email phone address"
//       )
//       .populate(
//         "pickupDeliveryUser",
//         "name email phone"
//       )
//       .populate(
//         "dropDeliveryUser",
//         "name email phone"
//       )
//       .populate(
//         "assignedBy",
//         "name email"
//       );

//     // ======================================
//     // ORDER NOT FOUND
//     // ======================================

//     if (!updatedOrder) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // ======================================
//     // SUCCESS
//     // ======================================

//     return res.status(200).json({
//       success: true,
//       message: "Delivery person assigned successfully",
//       data: updatedOrder,
//     });

//   } catch (error) {
//     console.error("========== ASSIGN ERROR ==========");
//     console.error("Name:", error.name);
//     console.error("Message:", error.message);
//     console.error("Stack:", error.stack);
//     console.error("==================================");

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



// const mongoose = require("mongoose");

// const Order = require("../models/Order");
// const User = require("../models/Users");

// // =====================================================
// // GET ALL ADMIN ORDERS
// // GET /api/admin/orders
// // =====================================================

// exports.getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate(
//         "customer",
//         "name email phone address"
//       )
//       .populate(
//         "pickupDeliveryUser",
//         "name email phone"
//       )
//       .populate(
//         "dropDeliveryUser",
//         "name email phone"
//       )
//       .populate(
//         "assignedBy",
//         "name email"
//       )
//       .sort({
//         createdAt: -1,
//       });

//     const formattedOrders =
//       orders.map((order) => ({
//         id: order._id.toString(),

//         orderNumber:
//           order.orderNumber,

//         customer:
//           order.customer
//             ? {
//                 id: order.customer._id.toString(),
//                 name: order.customer.name,
//                 email: order.customer.email,
//                 phone: order.customer.phone,
//                 address: order.customer.address,
//               }
//             : null,

//         serviceName:
//           order.serviceName,

//         items:
//           order.items,

//         deliveryPreference:
//           order.deliveryPreference,

//         pickupAt:
//           order.pickupAt,

//         expectedDeliveryAt:
//           order.expectedDeliveryAt,

//         subtotal:
//           order.subtotal,

//         finalAmount:
//           order.finalAmount,

//         paymentMethod:
//           order.paymentMethod,

//         paymentStatus:
//           order.paymentStatus,

//         status:
//           order.status,

//         pickupDeliveryUser:
//           order.pickupDeliveryUser
//             ? {
//                 id:
//                   order.pickupDeliveryUser._id.toString(),
//                 name:
//                   order.pickupDeliveryUser.name,
//                 phone:
//                   order.pickupDeliveryUser.phone,
//                 email:
//                   order.pickupDeliveryUser.email,
//               }
//             : null,

//         dropDeliveryUser:
//           order.dropDeliveryUser
//             ? {
//                 id:
//                   order.dropDeliveryUser._id.toString(),
//                 name:
//                   order.dropDeliveryUser.name,
//                 phone:
//                   order.dropDeliveryUser.phone,
//                 email:
//                   order.dropDeliveryUser.email,
//               }
//             : null,

//         assignedAt:
//           order.assignedAt,

//         assignedBy:
//           order.assignedBy
//             ? {
//                 id:
//                   order.assignedBy._id.toString(),
//                 name:
//                   order.assignedBy.name,
//                 email:
//                   order.assignedBy.email,
//               }
//             : null,

//         createdAt:
//           order.createdAt,

//         updatedAt:
//           order.updatedAt,
//       }));

//     return res.status(200).json({
//       success: true,
//       count: formattedOrders.length,
//       data: formattedOrders,
//     });
//   } catch (error) {
//     console.error(
//       "Get All Orders Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // =====================================================
// // GET SINGLE ADMIN ORDER
// // GET /api/admin/orders/:id
// // =====================================================

// exports.getOrderById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid order ID",
//       });
//     }

//     const order =
//       await Order.findById(id)
//         .populate(
//           "customer",
//           "name email phone address"
//         )
//         .populate(
//           "pickupDeliveryUser",
//           "name email phone"
//         )
//         .populate(
//           "dropDeliveryUser",
//           "name email phone"
//         )
//         .populate(
//           "assignedBy",
//           "name email"
//         );

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: order,
//     });
//   } catch (error) {
//     console.error(
//       "Get Admin Order Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // =====================================================
// // GET DELIVERY PERSONS
// // GET /api/admin/delivery-persons
// // =====================================================

// exports.getDeliveryPersons = async (
//   req,
//   res
// ) => {
//   try {
//     const deliveryPersons =
//       await User.find({
//         role: "delivery",
//         isActive: true,
//       }).select(
//         "name email phone busy"
//       );

//     return res.status(200).json({
//       success: true,
//       count:
//         deliveryPersons.length,

//       data:
//         deliveryPersons.map(
//           (person) => ({
//             id:
//               person._id.toString(),

//             name:
//               person.name,

//             email:
//               person.email,

//             phone:
//               person.phone,

//             busy:
//               person.busy || false,
//           })
//         ),
//     });
//   } catch (error) {
//     console.error(
//       "Get Delivery Persons Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // =====================================================
// // ASSIGN DELIVERY PERSON
// // PUT /api/admin/orders/:id/assign
// // =====================================================

// exports.assignDeliveryPerson = async (
//   req,
//   res
// ) => {
//   try {
//     const { id } = req.params;

//     const {
//       deliveryPersonId,
//     } = req.body;

//     console.log(
//       "========== ASSIGN DELIVERY =========="
//     );

//     console.log(
//       "Order ID:",
//       id
//     );

//     console.log(
//       "Request Body:",
//       req.body
//     );

//     console.log(
//       "Logged User:",
//       req.user
//     );

//     console.log(
//       "====================================="
//     );

//     // ==========================================
//     // VALIDATE ORDER ID
//     // ==========================================

//     if (
//       !mongoose.Types.ObjectId.isValid(id)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid order ID",
//       });
//     }

//     // ==========================================
//     // VALIDATE DELIVERY PERSON ID
//     // ==========================================

//     if (!deliveryPersonId) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "deliveryPersonId is required",
//       });
//     }

//     if (
//       !mongoose.Types.ObjectId.isValid(
//         deliveryPersonId
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid delivery person ID",
//       });
//     }

//     // ==========================================
//     // FIND DELIVERY PERSON
//     // ==========================================

//     const deliveryPerson =
//       await User.findOne({
//         _id: deliveryPersonId,
//         role: "delivery",
//         isActive: true,
//       });

//     if (!deliveryPerson) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Delivery person not found or inactive",
//       });
//     }

//     // ==========================================
//     // CHECK ORDER EXISTS
//     // ==========================================

//     const existingOrder =
//       await Order.findById(id).select(
//         "_id orderNumber status"
//       );

//     if (!existingOrder) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // ==========================================
//     // GET ADMIN ID
//     // ==========================================

//     const adminId =
//       req.user?._id ||
//       req.user?.id;

//     if (
//       !adminId ||
//       !mongoose.Types.ObjectId.isValid(
//         adminId
//       )
//     ) {
//       return res.status(401).json({
//         success: false,
//         message:
//           "Invalid authenticated admin",
//       });
//     }

//     // ==========================================
//     // UPDATE ONLY ASSIGNMENT FIELDS
//     // ==========================================

//     const updatedOrder =
//       await Order.findByIdAndUpdate(
//         id,
//         {
//           $set: {
//             pickupDeliveryUser:
//               deliveryPerson._id,

//             assignedAt:
//               new Date(),

//             assignedBy:
//               adminId,

//             status:
//               "PICKUP_ASSIGNED",
//           },
//         },
//         {
//           new: true,

//           // IMPORTANT:
//           // Existing legacy/broken orders may
//           // contain missing required fields.
//           runValidators: false,
//         }
//       )
//         .populate(
//           "customer",
//           "name email phone address"
//         )
//         .populate(
//           "pickupDeliveryUser",
//           "name email phone"
//         )
//         .populate(
//           "dropDeliveryUser",
//           "name email phone"
//         )
//         .populate(
//           "assignedBy",
//           "name email"
//         );

//     if (!updatedOrder) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // ==========================================
//     // SUCCESS
//     // ==========================================

//     console.log(
//       "Delivery person assigned successfully"
//     );

//     return res.status(200).json({
//       success: true,
//       message:
//         "Delivery person assigned successfully",
//       data: updatedOrder,
//     });
//   } catch (error) {
//     console.error(
//       "========== ASSIGN ERROR =========="
//     );

//     console.error(
//       "Name:",
//       error.name
//     );

//     console.error(
//       "Message:",
//       error.message
//     );

//     console.error(
//       "Stack:",
//       error.stack
//     );

//     console.error(
//       "=================================="
//     );

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };




const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/Users");

// =====================================================
// GET ALL ADMIN ORDERS
// GET /api/admin/orders
// =====================================================

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate(
        "customer",
        "name email phone address"
      )
      .populate(
        "pickupDeliveryUser",
        "name email phone busy isActive"
      )
      .populate(
        "dropDeliveryUser",
        "name email phone busy isActive"
      )
      .populate(
        "assignedBy",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),

      orderNumber: order.orderNumber,

      customer: order.customer
        ? {
            id: order.customer._id.toString(),
            name: order.customer.name || "Customer",
            email: order.customer.email,
            phone: order.customer.phone,
            address: order.customer.address,
          }
        : null,

      serviceName: order.serviceName || "Service",

      items: order.items || [],

      deliveryPreference:
        order.deliveryPreference,

      pickupAt: order.pickupAt,

      expectedDeliveryAt:
        order.expectedDeliveryAt,

      subtotal: order.subtotal || 0,

      finalAmount:
        order.finalAmount || 0,

      paymentMethod:
        order.paymentMethod || "UNKNOWN",

      paymentStatus:
        order.paymentStatus || "PENDING",

      status:
        order.status || "UNKNOWN",

      pickupDeliveryUser:
        order.pickupDeliveryUser
          ? {
              id:
                order.pickupDeliveryUser._id.toString(),

              name:
                order.pickupDeliveryUser.name,

              phone:
                order.pickupDeliveryUser.phone,

              email:
                order.pickupDeliveryUser.email,

              busy:
                order.pickupDeliveryUser.busy || false,

              isActive:
                order.pickupDeliveryUser.isActive !== false,
            }
          : null,

      dropDeliveryUser:
        order.dropDeliveryUser
          ? {
              id:
                order.dropDeliveryUser._id.toString(),

              name:
                order.dropDeliveryUser.name,

              phone:
                order.dropDeliveryUser.phone,

              email:
                order.dropDeliveryUser.email,

              busy:
                order.dropDeliveryUser.busy || false,

              isActive:
                order.dropDeliveryUser.isActive !== false,
            }
          : null,

      assignedAt:
        order.assignedAt,

      assignedBy:
        order.assignedBy
          ? {
              id:
                order.assignedBy._id.toString(),

              name:
                order.assignedBy.name,

              email:
                order.assignedBy.email,
            }
          : null,

      createdAt:
        order.createdAt,

      updatedAt:
        order.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedOrders.length,
      data: formattedOrders,
    });
  } catch (error) {
    console.error(
      "Get All Orders Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE ADMIN ORDER
// GET /api/admin/orders/:id
// =====================================================

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order =
      await Order.findById(id)
        .populate(
          "customer",
          "name email phone address"
        )
        .populate(
          "pickupDeliveryUser",
          "name email phone busy isActive"
        )
        .populate(
          "dropDeliveryUser",
          "name email phone busy isActive"
        )
        .populate(
          "assignedBy",
          "name email"
        );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const formattedOrder = {
      id: order._id.toString(),

      orderNumber:
        order.orderNumber,

      customer:
        order.customer
          ? {
              id:
                order.customer._id.toString(),

              name:
                order.customer.name ||
                "Customer",

              email:
                order.customer.email,

              phone:
                order.customer.phone,

              address:
                order.customer.address,
            }
          : null,

      serviceName:
        order.serviceName ||
        "Service",

      items:
        order.items || [],

      deliveryPreference:
        order.deliveryPreference,

      pickupAt:
        order.pickupAt,

      expectedDeliveryAt:
        order.expectedDeliveryAt,

      subtotal:
        order.subtotal || 0,

      finalAmount:
        order.finalAmount || 0,

      paymentMethod:
        order.paymentMethod ||
        "UNKNOWN",

      paymentStatus:
        order.paymentStatus ||
        "PENDING",

      status:
        order.status ||
        "UNKNOWN",

      pickupDeliveryUser:
        order.pickupDeliveryUser
          ? {
              id:
                order.pickupDeliveryUser._id.toString(),

              name:
                order.pickupDeliveryUser.name,

              phone:
                order.pickupDeliveryUser.phone,

              email:
                order.pickupDeliveryUser.email,

              busy:
                order.pickupDeliveryUser.busy ||
                false,

              isActive:
                order.pickupDeliveryUser.isActive !== false,
            }
          : null,

      dropDeliveryUser:
        order.dropDeliveryUser
          ? {
              id:
                order.dropDeliveryUser._id.toString(),

              name:
                order.dropDeliveryUser.name,

              phone:
                order.dropDeliveryUser.phone,

              email:
                order.dropDeliveryUser.email,

              busy:
                order.dropDeliveryUser.busy ||
                false,

              isActive:
                order.dropDeliveryUser.isActive !== false,
            }
          : null,

      assignedAt:
        order.assignedAt,

      assignedBy:
        order.assignedBy
          ? {
              id:
                order.assignedBy._id.toString(),

              name:
                order.assignedBy.name,

              email:
                order.assignedBy.email,
            }
          : null,

      createdAt:
        order.createdAt,

      updatedAt:
        order.updatedAt,
    };

    return res.status(200).json({
      success: true,
      data: formattedOrder,
    });
  } catch (error) {
    console.error(
      "Get Admin Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET DELIVERY PERSONS
// GET /api/admin/delivery-persons
// =====================================================

exports.getDeliveryPersons = async (
  req,
  res
) => {
  try {
    const deliveryPersons =
      await User.find({
        role: "delivery",
        isActive: true,
      })
        .select(
          "name email phone busy isActive"
        )
        .sort({
          name: 1,
        });

    return res.status(200).json({
      success: true,

      count:
        deliveryPersons.length,

      data:
        deliveryPersons.map(
          (person) => ({
            id:
              person._id.toString(),

            name:
              person.name,

            email:
              person.email,

            phone:
              person.phone,

            busy:
              person.busy || false,

            isActive:
              person.isActive !== false,
          })
        ),
    });
  } catch (error) {
    console.error(
      "Get Delivery Persons Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// ASSIGN DELIVERY PERSON
// PUT /api/admin/orders/:id/assign
// =====================================================

exports.assignDeliveryPerson = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      deliveryPersonId,
    } = req.body;

    console.log(
      "========== ASSIGN DELIVERY =========="
    );

    console.log("Order ID:", id);

    console.log(
      "Delivery Person ID:",
      deliveryPersonId
    );

    console.log(
      "Logged User:",
      req.user
    );

    console.log(
      "====================================="
    );

    // ==========================================
    // VALIDATE ORDER ID
    // ==========================================

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // ==========================================
    // VALIDATE DELIVERY PERSON ID
    // ==========================================

    if (!deliveryPersonId) {
      return res.status(400).json({
        success: false,
        message:
          "deliveryPersonId is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        deliveryPersonId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid delivery person ID",
      });
    }

    // ==========================================
    // FIND DELIVERY PERSON
    // ==========================================

    const deliveryPerson =
      await User.findOne({
        _id: deliveryPersonId,
        role: "delivery",
        isActive: true,
      });

    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message:
          "Delivery person not found or inactive",
      });
    }

    // ==========================================
    // FIND ORDER
    // ==========================================

    const existingOrder =
      await Order.findById(id);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // ADMIN ID
    // ==========================================

    const adminId =
      req.user?._id ||
      req.user?.id;

    if (
      !adminId ||
      !mongoose.Types.ObjectId.isValid(
        adminId
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authenticated admin",
      });
    }

    // ==========================================
    // ASSIGN DELIVERY PERSON
    // ==========================================

    existingOrder.pickupDeliveryUser =
      deliveryPerson._id;

    existingOrder.assignedAt =
      new Date();

    existingOrder.assignedBy =
      adminId;

    existingOrder.status =
      "PICKUP_ASSIGNED";

    await existingOrder.save();

    // ==========================================
    // POPULATE RESPONSE
    // ==========================================

    const updatedOrder =
      await Order.findById(id)
        .populate(
          "customer",
          "name email phone address"
        )
        .populate(
          "pickupDeliveryUser",
          "name email phone busy isActive"
        )
        .populate(
          "dropDeliveryUser",
          "name email phone busy isActive"
        )
        .populate(
          "assignedBy",
          "name email"
        );

    return res.status(200).json({
      success: true,

      message:
        "Delivery person assigned successfully",

      data: updatedOrder,
    });
  } catch (error) {
    console.error(
      "========== ASSIGN ERROR =========="
    );

    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    console.error(
      "=================================="
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};