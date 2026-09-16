// require("dotenv").config();

// const express = require("express");
// const mongoose = require("mongoose");

// const authRoutes = require("./routes/authRoutes");
// const adminRoutes = require("./routes/adminRoutes");
// const customerRoutes = require("./routes/serviceRequestRoutes");

// const app = express();

// app.use(express.json());

// const PORT = process.env.PORT|| 5000;

// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => {
//     console.log(
//       "MongoDB Connected Successfully"
//     );

//     app.listen(PORT, () => {
//       console.log(
//         `Server running on port ${PORT}`
//       );
//     });
//   })
//   .catch(error => {
//     console.error(
//       "MongoDB Connection Failed:",
//       error.message
//     );
//   });

// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "Laundry Service API is running",
//   });
// });

// app.use("/api/auth", authRoutes);

// app.use("/api/admin", adminRoutes);

// app.use("/api/customer", customerRoutes);





const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");


// ===============================
// ROUTES
// ===============================

const authRoutes =
  require("./routes/authRoutes");

const adminRoutes =
  require("./routes/adminRoutes");

const customerRoutes =
  require("./routes/customerRoutes");

const serviceRequestRoutes =
  require("./routes/serviceRequestRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const walletRoutes =
  require("./routes/walletRoutes");

const coinRoutes =
  require("./routes/coinRoutes");

const coinTransactionRoutes =
  require("./routes/coinTransactionRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");

const catalogRoutes = require("./routes/catalogRoutes");
const supportRoutes = require('./routes/supportRoutes');

const adminOrderRoutes =
  require("./routes/adminOrderRoutes");

  const reviewRoutes = require('./routes/reviewRoutes');

  const invoiceRoutes = require("./routes/invoiceRoutes");

  const deliveryRoutes = require('./routes/deliveryRoutes');



// ===============================
// EXPRESS APP
// ===============================

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());


// ===============================
// PORT
// ===============================

const PORT =
  process.env.PORT || 5000;


// ===============================
// ROOT API
// ===============================

app.get("/", (req, res) => {

  res.status(200).json({
    success: true,
    message:
      "Laundry Service API is running",
  });

});


// ===============================
// AUTH ROUTES
// ===============================

app.use(
  "/api/auth",
  authRoutes
);


//delivery

app.use('/api/delivery', deliveryRoutes);

// ===============================
// ADMIN ROUTES
// ===============================

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/admin",
  adminOrderRoutes
);

// ===============================
// CUSTOMER ROUTES
// ===============================

app.use(
  "/api/customer",
  customerRoutes
);

app.use('/api/orders', orderRoutes);

//invoice
app.use(
  "/api/invoices",
  invoiceRoutes
);


// ===============================
// SERVICE REQUEST ROUTES
// ===============================

app.use(
  "/api/customer/service-request",
  serviceRequestRoutes
);



// ===============================
// ORDER ROUTES
// ===============================

app.use(
  "/api/orders",
  orderRoutes
);


// ===============================
// WALLET ROUTES
// ===============================

app.use(
  "/api/wallet",
  walletRoutes
);


// ===============================
// COIN ROUTES
// ===============================

app.use(
  "/api/coins",
  coinRoutes
);

app.use('/api/reviews', reviewRoutes);


// ===============================
// COIN TRANSACTION ROUTES
// ===============================

app.use(
  "/api/coin-transactions",
  coinTransactionRoutes
);


// ===============================
// NOTIFICATION ROUTES
// ===============================

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use("/api/catalog", catalogRoutes);
app.use('/api/support', supportRoutes);



// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });

});


// ===============================
// DATABASE CONNECTION
// ===============================

mongoose
  .connect(process.env.MONGO_URL)

  .then(() => {

    console.log(
      "MongoDB Connected Successfully"
    );

    app.listen(
      PORT,
      () => {

        console.log(
          `Server running on port ${PORT}`
        );

      }
    );

  })

  .catch((error) => {

    console.error(
      "MongoDB Connection Failed:",
      error.message
    );

  });