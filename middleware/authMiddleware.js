// const jwt = require("jsonwebtoken");

// const protect = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         success: false,
//         message: "Not authorized. Token required",
//       });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     req.user = decoded;

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token",
//     });
//   }
// };

// module.exports = protect;

const jwt = require("jsonwebtoken");

// ========================================
// PROTECT MIDDLEWARE
// ========================================

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Store user data from JWT
    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      "Authentication Error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


// ========================================
// AUTHORIZE ROLE MIDDLEWARE
// ========================================

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this resource",
      });
    }

    next();
  };
};


// ========================================
// ADMIN ONLY MIDDLEWARE
// ========================================

const adminOnly = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};


// ========================================
// DELIVERY ONLY MIDDLEWARE
// ========================================

const deliveryOnly = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  if (req.user.role !== "delivery") {
    return res.status(403).json({
      success: false,
      message:
        "Delivery access required",
    });
  }

  next();
};


// ========================================
// EXPORTS
// ========================================

module.exports = {
  protect,
  authorize,
  adminOnly,
  deliveryOnly,
};