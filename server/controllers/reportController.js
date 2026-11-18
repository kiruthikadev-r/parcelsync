const Parcel = require("../models/Parcel");
const User = require("../models/User");
const DeliveryAssignment = require("../models/DeliveryAssignment");
const toCsv = require("../utils/toCsv");

function dateFilter(fromDate, toDate, field = "bookingDate") {
  if (!fromDate && !toDate) return {};
  const range = {};
  if (fromDate) range.$gte = new Date(fromDate);
  if (toDate) range.$lte = new Date(toDate);
  return { [field]: range };
}

async function getBookingReport(req, res) {
  const { period = "daily", fromDate, toDate } = req.query;
  const format = period === "monthly" ? "%Y-%m" : "%Y-%m-%d";

  const rows = await Parcel.aggregate([
    { $match: dateFilter(fromDate, toDate) },
    { $group: { _id: { $dateToString: { format, date: "$bookingDate" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, period: "$_id", count: 1 } },
  ]);

  res.json({ period, rows });
}

async function getDeliveryPerformanceReport(req, res) {
  const { fromDate, toDate } = req.query;
  const match = dateFilter(fromDate, toDate, "createdAt");

  const [completed, failed, byStatus] = await Promise.all([
    DeliveryAssignment.countDocuments({ ...match, status: "Completed" }),
    DeliveryAssignment.countDocuments({ ...match, status: "Failed" }),
    DeliveryAssignment.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]),
  ]);

  res.json({ completed, failed, byStatus });
}

async function getPersonnelPerformanceReport(req, res) {
  const personnel = await User.find({ role: "delivery_personnel" });

  const rows = await Promise.all(
    personnel.map(async (person) => {
      const [assigned, completed, failed] = await Promise.all([
        DeliveryAssignment.countDocuments({ deliveryPersonnel: person._id }),
        DeliveryAssignment.countDocuments({ deliveryPersonnel: person._id, status: "Completed" }),
        DeliveryAssignment.countDocuments({ deliveryPersonnel: person._id, status: "Failed" }),
      ]);
      return { id: person._id, name: person.name, email: person.email, assignedArea: person.assignedArea, assigned, completed, failed };
    })
  );

  res.json({ rows });
}

async function getPendingParcelReport(req, res) {
  const { fromDate, toDate } = req.query;
  const parcels = await Parcel.find({
    status: { $in: ["Booked", "Dispatched", "In Transit", "Out for Delivery"] },
    ...dateFilter(fromDate, toDate),
  }).sort({ bookingDate: 1 });
  res.json({ parcels });
}

async function getReturnedParcelReport(req, res) {
  const { fromDate, toDate } = req.query;
  const parcels = await Parcel.find({ status: "Returned", ...dateFilter(fromDate, toDate) }).sort({ bookingDate: -1 });
  res.json({ parcels });
}

async function exportReportCsv(req, res) {
  const { type, fromDate, toDate } = req.query;

  let rows = [];
  let columns = [];

  if (type === "pending" || type === "returned") {
    const status = type === "pending" ? { $in: ["Booked", "Dispatched", "In Transit", "Out for Delivery"] } : "Returned";
    const parcels = await Parcel.find({ status, ...dateFilter(fromDate, toDate) }).sort({ bookingDate: -1 });
    rows = parcels.map((p) => ({
      trackingNumber: p.trackingNumber,
      sender: p.sender.name,
      receiver: p.receiver.name,
      status: p.status,
      bookingDate: p.bookingDate?.toISOString().slice(0, 10),
      city: p.receiver.city,
    }));
    columns = [
      { key: "trackingNumber", label: "Tracking Number" },
      { key: "sender", label: "Sender" },
      { key: "receiver", label: "Receiver" },
      { key: "status", label: "Status" },
      { key: "bookingDate", label: "Booking Date" },
      { key: "city", label: "City" },
    ];
  } else if (type === "personnel-performance") {
    const personnel = await User.find({ role: "delivery_personnel" });
    rows = await Promise.all(
      personnel.map(async (person) => {
        const [assigned, completed, failed] = await Promise.all([
          DeliveryAssignment.countDocuments({ deliveryPersonnel: person._id }),
          DeliveryAssignment.countDocuments({ deliveryPersonnel: person._id, status: "Completed" }),
          DeliveryAssignment.countDocuments({ deliveryPersonnel: person._id, status: "Failed" }),
        ]);
        return { name: person.name, email: person.email, assignedArea: person.assignedArea, assigned, completed, failed };
      })
    );
    columns = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "assignedArea", label: "Area" },
      { key: "assigned", label: "Assigned" },
      { key: "completed", label: "Completed" },
      { key: "failed", label: "Failed" },
    ];
  } else if (type === "bookings") {
    const parcels = await Parcel.find(dateFilter(fromDate, toDate)).sort({ bookingDate: -1 });
    rows = parcels.map((p) => ({
      trackingNumber: p.trackingNumber,
      sender: p.sender.name,
      receiver: p.receiver.name,
      status: p.status,
      bookingDate: p.bookingDate?.toISOString().slice(0, 10),
      charges: p.deliveryCharges,
      paymentStatus: p.paymentStatus,
    }));
    columns = [
      { key: "trackingNumber", label: "Tracking Number" },
      { key: "sender", label: "Sender" },
      { key: "receiver", label: "Receiver" },
      { key: "status", label: "Status" },
      { key: "bookingDate", label: "Booking Date" },
      { key: "charges", label: "Delivery Charges" },
      { key: "paymentStatus", label: "Payment Status" },
    ];
  } else {
    return res.status(400).json({ message: "type must be one of: bookings, pending, returned, personnel-performance" });
  }

  const csv = toCsv(rows, columns);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${type}-report.csv"`);
  res.send(csv);
}

module.exports = {
  getBookingReport,
  getDeliveryPerformanceReport,
  getPersonnelPerformanceReport,
  getPendingParcelReport,
  getReturnedParcelReport,
  exportReportCsv,
};
