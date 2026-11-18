const Parcel = require("../models/Parcel");
const ShipmentHistory = require("../models/ShipmentHistory");

async function trackParcel(req, res) {
  const { trackingNumber } = req.params;
  const parcel = await Parcel.findOne({ trackingNumber: trackingNumber.trim() });
  if (!parcel) return res.status(404).json({ message: "No parcel found with that tracking number" });

  const history = await ShipmentHistory.find({ parcel: parcel._id }).sort({ createdAt: 1 }).select("status note createdAt");

  res.json({
    trackingNumber: parcel.trackingNumber,
    senderName: parcel.sender.name,
    receiverName: parcel.receiver.name,
    bookingDate: parcel.bookingDate,
    status: parcel.status,
    expectedDeliveryDate: parcel.expectedDeliveryDate,
    deliveredAt: parcel.deliveredAt,
    latestUpdate: history[history.length - 1] || null,
    history,
  });
}

module.exports = { trackParcel };
