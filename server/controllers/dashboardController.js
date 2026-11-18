const Parcel = require("../models/Parcel");
const User = require("../models/User");
const DeliveryAssignment = require("../models/DeliveryAssignment");
const ShipmentHistory = require("../models/ShipmentHistory");

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getDashboardStats(req, res) {
  const [
    totalParcels,
    todaysBookings,
    inTransit,
    outForDelivery,
    delivered,
    pending,
    returned,
    totalDeliveryPersonnel,
  ] = await Promise.all([
    Parcel.countDocuments({}),
    Parcel.countDocuments({ bookingDate: { $gte: startOfToday() } }),
    Parcel.countDocuments({ status: "In Transit" }),
    Parcel.countDocuments({ status: "Out for Delivery" }),
    Parcel.countDocuments({ status: "Delivered" }),
    Parcel.countDocuments({ status: { $in: ["Booked", "Dispatched"] } }),
    Parcel.countDocuments({ status: "Returned" }),
    User.countDocuments({ role: "delivery_personnel" }),
  ]);

  const statusDistribution = await Parcel.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { _id: 0, status: "$_id", count: 1 } },
  ]);

  const monthlyBookings = await Parcel.aggregate([
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$bookingDate" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, month: "$_id", count: 1 } },
  ]);

  const weeklyTrend = await Parcel.aggregate([
    { $match: { bookingDate: { $gte: new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: { $dateToString: { format: "%Y-%W", date: "$bookingDate" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, week: "$_id", count: 1 } },
  ]);

  const [successfulDeliveries, failedDeliveries] = await Promise.all([
    DeliveryAssignment.countDocuments({ status: "Completed" }),
    DeliveryAssignment.countDocuments({ status: "Failed" }),
  ]);

  res.json({
    totalParcels,
    todaysBookings,
    inTransit,
    outForDelivery,
    delivered,
    pending,
    returned,
    totalDeliveryPersonnel,
    statusDistribution,
    monthlyBookings,
    weeklyTrend,
    successfulDeliveries,
    failedDeliveries,
  });
}

async function getRecentActivity(req, res) {
  const [recentBookings, recentActivity] = await Promise.all([
    Parcel.find({}).sort({ createdAt: -1 }).limit(8),
    ShipmentHistory.find({}).sort({ createdAt: -1 }).limit(8).populate("parcel", "trackingNumber").populate("updatedBy", "name role"),
  ]);
  res.json({ recentBookings, recentActivity });
}

module.exports = { getDashboardStats, getRecentActivity };
