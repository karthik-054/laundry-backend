require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/Users");

async function createAdmin() {
  try {
    console.log(
      "MONGO_URL exists:",
      !!process.env.MONGO_URL
    );

    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB connected");

    const password = "Admin@123";

    // Hash the admin password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create admin if not exists,
    // otherwise update existing admin
    const admin = await User.findOneAndUpdate(
      {
        email: "admin@laundry.com",
      },
      {
        name: "Laundry Admin",
        email: "admin@laundry.com",
        password: hashedPassword,
        phone: "9999999999",
        role: "admin",
        isActive: true,
      },
      {
        new: true,
        upsert: true,
      }
    );

    console.log("✅ Admin created/updated");

    console.log({
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      isActive: admin.isActive,
    });

    // Verify password
    const passwordCorrect =
      await bcrypt.compare(
        password,
        admin.password
      );

    console.log(
      "Password correct:",
      passwordCorrect
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Error:",
      error.message
    );

    process.exit(1);
  }
}

createAdmin();