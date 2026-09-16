const express = require("express");

const router = express.Router();

const {
  getServices,
  getDressTypes,
  getServicePrices,
  getCatalogSettings,
} = require("../controllers/catalogController");

router.get("/services", getServices);

router.get("/dress-types", getDressTypes);

router.get("/prices", getServicePrices);

router.get('/settings', getCatalogSettings);

module.exports = router;