const express = require("express");
const cors = require("cors");

const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const parcelRoutes = require("./routes/parcels");
const trackingRoutes = require("./routes/tracking");
const dispatchRoutes = require("./routes/dispatch");
const deliveryRoutes = require("./routes/delivery");
const notificationRoutes = require("./routes/notifications");
const dashboardRoutes = require("./routes/dashboard");
const reportRoutes = require("./routes/reports");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/parcels", parcelRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
