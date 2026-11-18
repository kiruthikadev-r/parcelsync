const dns = require("dns");
const mongoose = require("mongoose");

// This machine's configured DNS server (often a VPN/corporate one) fails to resolve
// the SRV records mongodb+srv:// needs, even though the OS resolver handles it fine.
// Point Node's own DNS resolution at a public resolver to work around it.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("PASTE_YOUR")) {
    throw new Error(
      "MONGODB_URI is not set. Create a MongoDB Atlas cluster and paste its connection string into server/.env (see README.md)."
    );
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  await mongoose.connect(uri, { dbName: "parcelsync" });
  console.log(`MongoDB Atlas connected: ${mongoose.connection.name}`);
}

module.exports = connectDB;
