const Service = require("../models/Service");

exports.getAllServices = async (req, res) => {
  try {

    const services = await Service.find({
      isActive: true
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};