// const express = require("express");

// const router = express.Router();

// const {
//   getServiceRequests,
//   approveServiceRequest,
//   rejectServiceRequest,
//   createDeliveryPerson,
//   getReports,
// } = require("../controllers/adminController");

// const {
//   protect,
//   adminOnly,
// } = require("../middleware/authMiddleware");

// const authorize = require("../middleware/roleMiddleware");


// // ======================================
// // SERVICE REQUESTS
// // ======================================

// router.get(
//   "/service-requests",
//   protect,
//   authorize("admin"),
//   getServiceRequests
// );


// router.put(
//   "/service-requests/:id/approve",
//   protect,
//   authorize("admin"),
//   approveServiceRequest
// );


// router.put(
//   "/service-requests/:id/reject",
//   protect,
//   authorize("admin"),
//   rejectServiceRequest
// );


// // ======================================
// // DELIVERY USERS
// // ======================================

// router.post(
//   "/delivery-users",
//   protect,
//   adminOnly,
//   createDeliveryPerson
// );


// // ======================================
// // REPORTS
// // ======================================

// router.get(
//   "/reports",
//   protect,
//   adminOnly,
//   getReports
// );


// module.exports = router;


const express = require("express");

const router = express.Router();

const {
  getServiceRequests,
  approveServiceRequest,
  rejectServiceRequest,
  createDeliveryPerson,
  getDeliveryPersons,
  getReports,
  updateOrderStatus,
} = require("../controllers/adminController");

const {
  protect,
} = require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

// =====================================================
// SERVICE REQUESTS
// =====================================================

router.get(
  "/service-requests",
  protect,
  authorize("admin"),
  getServiceRequests
);

router.put(
  "/service-requests/:id/approve",
  protect,
  authorize("admin"),
  approveServiceRequest
);

router.put(
  "/service-requests/:id/reject",
  protect,
  authorize("admin"),
  rejectServiceRequest
);

router.patch(
  "/orders/:id/status",
  protect,
  authorize("admin"),
  updateOrderStatus
);

// =====================================================
// DELIVERY USERS
// =====================================================

router.post(
  "/delivery-users",
  protect,
  authorize("admin"),
  createDeliveryPerson
);

// =====================================================
// REPORTS
// =====================================================

router.get(
  "/reports",
  protect,
  authorize("admin"),
  getReports
);

router.get(
  "/delivery-persons",
  protect,
  authorize("admin"),
  getDeliveryPersons
);

module.exports = router;