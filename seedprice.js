const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

require("dotenv").config();

const Service = require("./models/Service");
const DressType = require("./models/DressType");
const ServicePrice = require("./models/ServicePrice");

const prices = {
  Wash: {
    "T-Shirt": [25, 35],
    Shirt: [30, 40],
    Jeans: [50, 65],
    Pant: [45, 60],
    Shorts: [35, 50],
    Saree: [60, 80],
    Chudidar: [60, 80],
    Kurta: [50, 65],
    Kurti: [50, 65],
    Salwar: [50, 65],
    Blazer: [120, 160],
    Suit: [180, 230],
    Jacket: [100, 140],
    Sweater: [80, 110],
    Skirt: [45, 60],
    "Kids Wear": [30, 45],
    Bedsheet: [100, 130],
    "Pillow Cover": [30, 40],
    Blanket: [150, 200],
    Curtain: [120, 160],
  },

  "Dry Clean": {
    "T-Shirt": [50, 70],
    Shirt: [60, 80],
    Jeans: [80, 100],
    Pant: [70, 90],
    Shorts: [60, 80],
    Saree: [120, 160],
    Chudidar: [120, 160],
    Kurta: [100, 130],
    Kurti: [100, 130],
    Salwar: [100, 130],
    Blazer: [180, 230],
    Suit: [300, 380],
    Jacket: [180, 230],
    Sweater: [120, 160],
    Skirt: [90, 120],
    "Kids Wear": [60, 80],
    Bedsheet: [150, 200],
    "Pillow Cover": [40, 60],
    Blanket: [200, 280],
    Curtain: [180, 250],
  },

  Iron: {
    "T-Shirt": [10, 15],
    Shirt: [15, 20],
    Jeans: [20, 25],
    Pant: [20, 25],
    Shorts: [15, 20],
    Saree: [30, 40],
    Chudidar: [25, 35],
    Kurta: [20, 30],
    Kurti: [20, 30],
    Salwar: [20, 30],
    Blazer: [50, 70],
    Suit: [80, 100],
    Jacket: [40, 60],
    Sweater: [30, 40],
    Skirt: [20, 30],
    "Kids Wear": [10, 15],
    Bedsheet: [40, 50],
    "Pillow Cover": [10, 15],
    Blanket: [60, 80],
    Curtain: [50, 70],
  },

  "Wash & Iron": {
    "T-Shirt": [35, 45],
    Shirt: [40, 50],
    Jeans: [65, 80],
    Pant: [60, 75],
    Shorts: [45, 60],
    Saree: [80, 100],
    Chudidar: [80, 100],
    Kurta: [70, 85],
    Kurti: [70, 85],
    Salwar: [70, 85],
    Blazer: [150, 190],
    Suit: [220, 280],
    Jacket: [130, 170],
    Sweater: [100, 130],
    Skirt: [60, 80],
    "Kids Wear": [40, 55],
    Bedsheet: [130, 160],
    "Pillow Cover": [40, 50],
    Blanket: [180, 230],
    Curtain: [150, 190],
  },

  "Premium Care": {
    "T-Shirt": [80, 110],
    Shirt: [100, 130],
    Jeans: [120, 160],
    Pant: [110, 150],
    Shorts: [90, 120],
    Saree: [180, 240],
    Chudidar: [170, 220],
    Kurta: [150, 200],
    Kurti: [150, 200],
    Salwar: [150, 200],
    Blazer: [250, 320],
    Suit: [400, 500],
    Jacket: [250, 320],
    Sweater: [180, 240],
    Skirt: [140, 180],
    "Kids Wear": [100, 130],
    Bedsheet: [250, 320],
    "Pillow Cover": [70, 90],
    Blanket: [300, 400],
    Curtain: [250, 350],
  },

  "Stain Removal": {
    "T-Shirt": [60, 80],
    Shirt: [70, 90],
    Jeans: [80, 110],
    Pant: [80, 100],
    Shorts: [60, 80],
    Saree: [150, 200],
    Chudidar: [120, 160],
    Kurta: [100, 140],
    Kurti: [100, 140],
    Salwar: [100, 140],
    Blazer: [200, 260],
    Suit: [300, 400],
    Jacket: [180, 240],
    Sweater: [150, 200],
    Skirt: [90, 120],
    "Kids Wear": [60, 80],
    Bedsheet: [150, 200],
    "Pillow Cover": [40, 60],
    Blanket: [200, 280],
    Curtain: [180, 240],
  },

  "Curtain Cleaning": {
    Curtain: [150, 200],
    Bedsheet: [120, 160],
    Blanket: [180, 240],
  },

  "Blanket Cleaning": {
    Blanket: [200, 280],
    Bedsheet: [150, 200],
    "Pillow Cover": [50, 70],
  },
};

async function seedPrices() {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB Connected");

    const services = await Service.find({});
    const dressTypes = await DressType.find({});

    let inserted = 0;
    let skipped = 0;

    for (const service of services) {
      const servicePrices = prices[service.name];

      if (!servicePrices) {
        console.log(`No pricing configuration for: ${service.name}`);
        continue;
      }

      for (const dressType of dressTypes) {
        const price = servicePrices[dressType.name];

        if (!price) {
          continue;
        }

        const normalPrice = price[0];
        const quickPrice = price[1];

        // NORMAL
        const normalExists = await ServicePrice.findOne({
          service: service._id,
          dressType: dressType._id,
          deliveryPreference: "normal",
        });

        if (!normalExists) {
          await ServicePrice.create({
            service: service._id,
            dressType: dressType._id,
            deliveryPreference: "normal",
            unitPrice: normalPrice,
            isActive: true,
          });

          inserted++;
        } else {
          skipped++;
        }

        // QUICK
        const quickExists = await ServicePrice.findOne({
          service: service._id,
          dressType: dressType._id,
          deliveryPreference: "quick",
        });

        if (!quickExists) {
          await ServicePrice.create({
            service: service._id,
            dressType: dressType._id,
            deliveryPreference: "quick",
            unitPrice: quickPrice,
            isActive: true,
          });

          inserted++;
        } else {
          skipped++;
        }
      }
    }

    console.log("================================");
    console.log(`Prices inserted: ${inserted}`);
    console.log(`Prices skipped: ${skipped}`);
    console.log("Price seeding completed");
    console.log("================================");

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("Seed Error:", error);
    process.exit(1);
  }
}

seedPrices();