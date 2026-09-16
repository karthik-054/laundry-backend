const ServiceRequest = require("../models/ServiceRequest");

// ======================================
// Create Customer Service Request
// ======================================

exports.createServiceRequest = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      landmark,
      city,
      pincode,
    } = req.body;

    // Validation
    if (!name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Name, phone and email are required",
      });
    }

    if (!address || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Address, city and pincode are required",
      });
    }

    // Check existing pending request
    const existingRequest = await ServiceRequest.findOne({
      user: req.user.id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending service request",
      });
    }

    // Create request
    const serviceRequest = await ServiceRequest.create({
      user: req.user.id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Service request submitted successfully",
      request: serviceRequest,
    });
  } catch (error) {
    console.error(
      "Create Service Request Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get My Service Request
// ======================================

exports.getMyServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findOne({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error(
      "Get Service Request Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};