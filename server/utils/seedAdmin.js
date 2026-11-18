require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const NAME = process.env.ADMIN_NAME || "ParcelSync Admin";
const EMAIL = process.env.ADMIN_EMAIL || "admin@parcelsync.com";
const PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

async function run() {
  await connectDB();

  const existing = await User.findOne({ email: EMAIL });
  if (existing) {
    console.log(`Admin already exists: ${EMAIL}`);
  } else {
    await User.create({ name: NAME, email: EMAIL, password: PASSWORD, role: "admin" });
    console.log(`Admin created: ${EMAIL} / ${PASSWORD}`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
