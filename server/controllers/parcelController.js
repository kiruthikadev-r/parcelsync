const Parcel = require("../models/Parcel");
const ShipmentHistory = require("../models/ShipmentHistory");
const DeliveryAssignment = require("../models/DeliveryAssignment");
const generateTrackingNumber = require("../utils/generateTrackingNumber");
const { applyStatusChange } = require("../services/shipmentService");

async function createParcel(req, res) {
  const {
    sender,
    receiver,
    category,
    description,
    weight,
    bookingDate,
    deliveryCharges,
    paymentStatus,
    paymentMethod,
    expectedDeliveryDate,
  } = req.body;

  if (!sender?.name || !sender?.phone || !sender?.address) {
    return res.status(400).json({ message: "Sender name, phone and address are required" });
  }
  if (!receiver?.name || !receiver?.phone || !receiver?.address || !receiver?.city || !receiver?.postalCode) {
    return res.status(400).json({ message: "Receiver name, phone, address, city and postal code are required" });
  }
  if (!category || weight === undefined || !paymentMethod) {
    return res.status(400).json({ message: "category, weight and paymentMethod are required" });
  }

  let trackingNumber = generateTrackingNumber();
  // Extremely unlikely collision, but guard against it rather than trust luck.
  while (await Parcel.exists({ trackingNumber })) {
    trackingNumber = generateTrackingNumber();
  }

  const parcel = await Parcel.create({
    trackingNumber,
    sender,
    receiver,
    category,
    description,
    weight,
    bookingDate: bookingDate || new Date(),
    deliveryCharges: deliveryCharges || 0,
    paymentStatus: paymentStatus || "Pending",
    paymentMethod,
    expectedDeliveryDate,
    createdBy: req.user._id,
  });

  await applyStatusChange({ parcel, status: "Booked", updatedBy: req.user._id });

  res.status(201).json({ parcel });
}

async function listParcels(req, res) {
  const { search, status, fromDate, toDate, page = 1, limit = 15, sort = "newest" } = req.query;
  const filter = {};

  // Booking staff see only their own bookings ("My Bookings"); admin sees everything.
  if (req.user.role === "booking_staff") filter.createdBy = req.user._id;

  if (status) filter.status = status;
  if (fromDate || toDate) {
    filter.bookingDate = {};
    if (fromDate) filter.bookingDate.$gte = new Date(fromDate);
    if (toDate) filter.bookingDate.$lte = new Date(toDate);
  }
  if (search) {
    filter.$or = [
      { trackingNumber: { $regex: search, $options: "i" } },
      { "sender.name": { $regex: search, $options: "i" } },
      { "receiver.name": { $regex: search, $options: "i" } },
    ];
  }

  const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 } };
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [parcels, total] = await Promise.all([
    Parcel.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Parcel.countDocuments(filter),
  ]);

  res.json({ parcels, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
}

async function getParcel(req, res) {
  const parcel = await Parcel.findById(req.params.id);
  if (!parcel) return res.status(404).json({ message: "Parcel not found" });

  if (req.user.role === "delivery_personnel") {
    const ownAssignment = await DeliveryAssignment.exists({ parcel: parcel._id, deliveryPersonnel: req.user._id });
    if (!ownAssignment) return res.status(403).json({ message: "Forbidden" });
  }

  const [history, assignment] = await Promise.all([
    ShipmentHistory.find({ parcel: parcel._id }).sort({ createdAt: 1 }).populate("updatedBy", "name role"),
    DeliveryAssignment.findOne({ parcel: parcel._id }).sort({ createdAt: -1 }).populate("deliveryPersonnel", "name phone assignedArea"),
  ]);

  res.json({ parcel, history, assignment });
}

async function updateParcel(req, res) {
  const parcel = await Parcel.findById(req.params.id);
  if (!parcel) return res.status(404).json({ message: "Parcel not found" });

  const locked = ["Delivered", "Cancelled", "Returned"].includes(parcel.status);
  if (locked && req.user.role !== "admin") {
    return res.status(403).json({ message: `This parcel is ${parcel.status} and can only be edited by an admin` });
  }

  const allowed = [
    "sender",
    "receiver",
    "category",
    "description",
    "weight",
    "deliveryCharges",
    "paymentStatus",
    "paymentMethod",
    "expectedDeliveryDate",
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) parcel[key] = req.body[key];
  }
  await parcel.save();
  res.json({ parcel });
}

async function cancelParcel(req, res) {
  const parcel = await Parcel.findById(req.params.id);
  if (!parcel) return res.status(404).json({ message: "Parcel not found" });

  if (parcel.status === "Delivered") {
    return res.status(400).json({ message: "A delivered parcel cannot be cancelled" });
  }
  if (parcel.status !== "Booked" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Only an admin can cancel a parcel that has already been dispatched" });
  }

  await applyStatusChange({ parcel, status: "Cancelled", note: req.body.reason, updatedBy: req.user._id });
  res.json({ parcel });
}

async function deleteParcel(req, res) {
  const parcel = await Parcel.findById(req.params.id);
  if (!parcel) return res.status(404).json({ message: "Parcel not found" });
  if (!["Booked", "Cancelled"].includes(parcel.status)) {
    return res.status(400).json({ message: "Only parcels that are still Booked or already Cancelled can be deleted" });
  }

  await Promise.all([
    ShipmentHistory.deleteMany({ parcel: parcel._id }),
    DeliveryAssignment.deleteMany({ parcel: parcel._id }),
    parcel.deleteOne(),
  ]);
  res.json({ message: "Parcel deleted" });
}

module.exports = { createParcel, listParcels, getParcel, updateParcel, cancelParcel, deleteParcel };
