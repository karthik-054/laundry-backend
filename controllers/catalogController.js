const Service = require('../models/Service')
const DressType = require('../models/DressType')
const ServicePrice = require('../models/ServicePrice')
const Faq = require('../models/Faq');

// ==========================================
// GET SERVICES
// ==========================================

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({
      isActive: true,
    }).sort({
      createdAt: 1,
    });

    const data = services.map(service => ({
      id: service._id.toString(),
      _id: service._id.toString(),

      name: service.name,

      category: service.category || 'basic',

      isPopular: service.isPopular || false,

      description: service.description || '',

      image: service.image || '',

      processingHoursNormal:
        service.processingHoursNormal || 48,

      processingHoursQuick:
        service.processingHoursQuick || 24,

      isActive: service.isActive,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Get Services Error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET DRESS TYPES
// ==========================================

exports.getDressTypes = async (req, res) => {
  try {
    const dresses = await DressType.find().sort({ name: 1 })

    const data = dresses.map(dress => ({
      id: dress._id.toString(),
      name: dress.name,
      price: dress.price || 0
    }))

    res.status(200).json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    console.error('Get Dress Types Error:', error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ==========================================
// GET SERVICE PRICES
// ==========================================

exports.getServicePrices = async (req, res) => {
  try {
    const prices = await ServicePrice.find({
      isActive: true
    })

    const data = prices.map(price => ({
      serviceId: price.service.toString(),
      dressTypeId: price.dressType.toString(),
      deliveryPreference: price.deliveryPreference,
      unitPrice: price.unitPrice
    }))

    res.status(200).json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    console.error('Get Service Prices Error:', error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//catlog settings


exports.getCatalogSettings = async (req, res) => {
  try {
    const faqs = await Faq.find({
      isActive: true,
    }).sort({
      order: 1,
      createdAt: 1,
    });

    const data = {
      settings: {},
      membershipPlans: [],
      faqs: faqs.map(faq => ({
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
      })),
    };

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      'Get Catalog Settings Error:',
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
