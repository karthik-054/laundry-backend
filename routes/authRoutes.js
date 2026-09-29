const express = require("express");

const router = express.Router();

const {
  registerCustomer,
  loginUser,
} = require("../controllers/authController");

// Customer Registration
router.post("/register", registerCustomer);

// All users login here
router.post("/login", loginUser);

module.exports = router;