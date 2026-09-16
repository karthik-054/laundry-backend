// const Customer = require('../models/Customer')
// const Wallet = require('../models/Wallet')
// const Coin = require('../models/Coin')
// const Order = require('../models/Order')
// const Service = require('../models/Service')
// const Advertisement = require('../models/Advertisement')
// const Notification = require('../models/Notification')

// // ==========================================
// // GET CUSTOMER DASHBOARD
// // ==========================================

// exports.getCustomerDashboard = async (req, res) => {
//   try {
//     // Your JWT middleware stores the decoded JWT
//     const userId = req.user.id

//     // Get customer profile
//     const customer = await Customer.findOne({
//       user: userId
//     })

//     // Get wallet
//     const wallet = await Wallet.findOne({
//       user: userId
//     })

//     // Get coins
//     const coin = await Coin.findOne({
//       user: userId
//     })

//     // Get active orders
//     // Get active orders
//     const activeOrders = await Order.find({
//       customer: userId,
//       status: {
//         $in: [
//           'ORDER_CREATED',
//           'ADMIN_CONFIRMED',
//           'PICKUP_ASSIGNED',
//           'OUT_FOR_PICKUP',
//           'PICKED_UP',
//           'PROCESSING',
//           'READY_FOR_DELIVERY',
//           'OUT_FOR_DELIVERY'
//         ]
//       }
//     })
//       .sort({ createdAt: -1 })
//       .limit(5)

//     // Basic services
//  const basicServices = await Service.find({
//   category: "Basic",
//   isActive: true
// })
//   .sort({ createdAt: 1 })
//   .limit(3);


// // ==========================================
// // POPULAR SERVICES
// // ==========================================

// const popularServices = await Service.find({
//   isPopular: true,
//   isActive: true
// })
//   .sort({ createdAt: 1 })
//   .limit(3);

//     // Advertisements
//     const advertisements = await Advertisement.find({
//       isActive: true
//     })

//     // Unread notification count
//     const unreadNotifications = await Notification.countDocuments({
//       user: userId,
//       isRead: false
//     })

//     // Response
//     res.status(200).json({
//       success: true,
//       message: 'Customer dashboard fetched successfully',

//       data: {
//         profile: customer
//           ? {
//               name: customer.name,
//               email: customer.email,
//               phone: customer.phone,
//               profileImage: customer.profileImage
//             }
//           : null,

//         wallet: {
//           balance: wallet?.balance || 0
//         },

//         coins: {
//           balance: coin?.balance || 0
//         },

//         activeOrders,

//         basicServices,

//         popularServices,

//         advertisements,

//         unreadNotifications
//       }
//     })
//   } catch (error) {
//     console.error('Customer Dashboard Error:', error)

//     res.status(500).json({
//       success: false,
//       message: error.message
//     })
//   }
// }


const Customer = require('../models/Customer');
const Wallet = require('../models/Wallet');
const Coin = require('../models/Coin');
const Order = require('../models/Order');
const Service = require('../models/Service');
const Advertisement = require('../models/Advertisement');
const Notification = require('../models/Notification');

// ==========================================
// GET CUSTOMER DASHBOARD
// ==========================================

exports.getCustomerDashboard = async (req, res) => {
  try {
    // JWT user ID
    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    // ==========================================
    // CUSTOMER PROFILE
    // ==========================================

    const customer = await Customer.findOne({
      user: userId,
    });

    // ==========================================
    // WALLET
    // ==========================================

    const wallet = await Wallet.findOne({
      user: userId,
    });

    // ==========================================
    // COINS
    // ==========================================

    const coin = await Coin.findOne({
      user: userId,
    });

    // ==========================================
    // ACTIVE ORDERS
    // ==========================================

    const activeOrders = await Order.find({
      customer: userId,
      status: {
        $in: [
          'ORDER_CREATED',
          'ADMIN_CONFIRMED',
          'PICKUP_ASSIGNED',
          'OUT_FOR_PICKUP',
          'PICKED_UP',
          'PROCESSING',
          'READY_FOR_DELIVERY',
          'OUT_FOR_DELIVERY',
        ],
      },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // ==========================================
    // BASIC SERVICES
    // IMPORTANT: category is lowercase
    // ==========================================

    const basicServices = await Service.find({
      category: 'basic',
      isActive: true,
    })
      .sort({ createdAt: 1 })
      .limit(3);

    // ==========================================
    // POPULAR SERVICES
    // ==========================================

    const popularServices = await Service.find({
      isPopular: true,
      isActive: true,
    })
      .sort({ createdAt: 1 })
      .limit(3);

    // ==========================================
    // ADVERTISEMENTS
    // ==========================================

    const advertisements = await Advertisement.find({
      isActive: true,
    });

    // ==========================================
    // UNREAD NOTIFICATIONS
    // ==========================================

    const unreadNotifications =
      await Notification.countDocuments({
        user: userId,
        isRead: false,
      });

    // ==========================================
    // DEBUG
    // ==========================================

    console.log(
      'Basic Services:',
      basicServices.map(service => ({
        id: service._id,
        name: service.name,
        category: service.category,
        isPopular: service.isPopular,
        image: service.image,
      }))
    );

    console.log(
      'Popular Services:',
      popularServices.map(service => ({
        id: service._id,
        name: service.name,
        category: service.category,
        isPopular: service.isPopular,
        image: service.image,
      }))
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: 'Customer dashboard fetched successfully',

      data: {
        profile: customer
          ? {
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              profileImage: customer.profileImage,
            }
          : null,

        wallet: {
          balance: wallet?.balance || 0,
        },

        coins: {
          balance: coin?.balance || 0,
        },

        activeOrders,

        basicServices,

        popularServices,

        advertisements,

        unreadNotifications,
      },
    });
  } catch (error) {
    console.error(
      'Customer Dashboard Error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};