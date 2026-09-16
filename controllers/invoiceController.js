const Order = require("../models/Order");

exports.getInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get the order
    const order = await Order.findById(orderId)
      .populate("customer")
      .populate("service");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Make sure the customer can only see their own invoice
    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?._id;

    if (
      order.customer &&
      userId &&
      String(order.customer._id || order.customer) !==
        String(userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this invoice",
      });
    }

    const items = (order.items || []).map(item => ({
      dressTypeId:
        item.dressTypeId
          ? String(item.dressTypeId)
          : "",

      dressName:
        item.dressName || "Item",

      quantity:
        Number(item.quantity || 0),

      unitPrice:
        Number(item.unitPrice || 0),

      lineTotal:
        Number(item.lineTotal || 0),
    }));

    const snapshot = {
      businessName: "Laundry Service",

      invoiceNumber:
        `INV-${String(order._id).slice(-6).toUpperCase()}`,

      orderNumber:
        order.orderNumber || String(order._id),

      orderId:
        String(order._id),

      date:
        order.createdAt,

      customer:
        order.customer?.name || "Customer",

      customerPhone:
        order.customer?.phone || "",

      customerEmail:
        order.customer?.email || "",

      address:
        order.profile?.address ||
        order.customer?.address ||
        "",

      landmark:
        order.profile?.landmark ||
        "",

      serviceName:
        order.serviceName ||
        order.service?.name ||
        "Laundry Service",

      deliveryPreference:
        order.deliveryPreference || "normal",

      items,

      subtotal:
        Number(order.subtotal || 0),

      serviceCharge:
        Number(order.serviceCharge || 0),

      quickDeliveryCharge:
        Number(order.quickDeliveryCharge || 0),

      membershipDiscount:
        Number(order.membershipDiscount || 0),

      coinsUsed:
        Number(
          order.coinsToRedeem ||
          order.coinsUsed ||
          0
        ),

      coinDiscount:
        Number(order.coinDiscount || 0),

      finalAmount:
        Number(order.finalAmount || 0),

      pickupAt:
        order.pickupAt,

      expectedDeliveryAt:
        order.expectedDeliveryAt,

      paymentMethod:
        order.paymentMethod || "",

      paymentStatus:
        order.paymentStatus || "",

      coinsEarned:
        Number(order.coinsEarned || 0),

      status:
        order.status || "",
    };

    return res.status(200).json({
      success: true,
      data: {
        snapshot,
      },
    });
  } catch (error) {
    console.error("Get Invoice Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};