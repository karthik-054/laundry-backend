// const express = require("express");

// const router = express.Router();

// const {
//   getAllOrders,
//   getOrderById,
//   getDeliveryPersons,
//   assignDeliveryPerson,
// } = require("../controllers/adminOrderController");

// const {
//   protect,
//   adminOnly,
// } = require("../middleware/authMiddleware");


// // ==============================================
// // GET ALL ORDERS
// // GET /api/admin/orders
// // ==============================================

// router.get(
//   "/orders",
//   protect,
//   adminOnly,
//   getAllOrders
// );


// // ==============================================
// // GET DELIVERY PERSONS
// // GET /api/admin/delivery-persons
// // ==============================================

// router.get(
//   "/delivery-persons",
//   protect,
//   adminOnly,
//   getDeliveryPersons
// );


// // ==============================================
// // GET SINGLE ORDER
// // GET /api/admin/orders/:id
// // ==============================================

// router.get(
//   "/orders/:id",
//   protect,
//   adminOnly,
//   getOrderById
// );


// // ==============================================
// // ASSIGN DELIVERY PERSON
// // PUT /api/admin/orders/:id/assign
// // ==============================================

// router.put(
//   "/orders/:id/assign",
//   protect,
//   adminOnly,
//   assignDeliveryPerson
// );


// module.exports = router;
const express = require("express");

const router = express.Router();

const {
  getAllOrders,
  getOrderById,
  getDeliveryPersons,
  assignDeliveryPerson,
} = require("../controllers/adminOrderController");

const {
  protect,
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

// =====================================================
// GET ALL ORDERS
// GET /api/admin/orders
// =====================================================

router.get(
  "/orders",
  protect,
  authorize("admin"),
  getAllOrders
);

// =====================================================
// GET DELIVERY PERSONS
// GET /api/admin/delivery-persons
// =====================================================

router.get(
  "/delivery-persons",
  protect,
  authorize("admin"),
  getDeliveryPersons
);

// =====================================================
// GET SINGLE ORDER
// GET /api/admin/orders/:id
// =====================================================

router.get(
  "/orders/:id",
  protect,
  authorize("admin"),
  getOrderById
);

// =====================================================
// ASSIGN DELIVERY PERSON
// PUT /api/admin/orders/:id/assign
// =====================================================

router.put(
  "/orders/:id/assign",
  protect,
  authorize("admin"),
  assignDeliveryPerson
);

module.exports = router;