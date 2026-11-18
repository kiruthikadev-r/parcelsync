const ShipmentHistory = require("../models/ShipmentHistory");
const User = require("../models/User");
const { notify, notifyAdmins } = require("./notificationService");

const NOTIFICATION_TYPE_BY_STATUS = {
  Booked: "parcel_booked",
  Dispatched: "parcel_dispatched",
  "In Transit": "in_transit",
  "Out for Delivery": "out_for_delivery",
  Delivered: "delivered",
  Returned: "delivery_failed",
};

async function getAdminIds() {
  const admins = await User.find({ role: "admin", isActive: true }).select("_id");
  return admins.map((a) => a._id);
}

// Updates parcel.status, writes the mandatory ShipmentHistory row, and fires the
// relevant notifications. Every status transition in the app must go through here
// so shipment history is never silently skipped.
async function applyStatusChange({ parcel, status, note, updatedBy }) {
  parcel.status = status;
  if (status === "Delivered") parcel.deliveredAt = new Date();
  if (note && (status === "Returned" || status === "Delivered")) parcel.deliveryRemarks = note;
  if (note && status === "Returned") parcel.failureReason = note;
  await parcel.save();

  await ShipmentHistory.create({ parcel: parcel._id, status, note, updatedBy });

  const type = NOTIFICATION_TYPE_BY_STATUS[status];
  if (type) {
    const adminIds = await getAdminIds();
    const title = `Parcel ${parcel.trackingNumber}: ${status}`;
    const message = note ? `${status}. ${note}` : `Status updated to ${status}.`;
    if (adminIds.length) await notifyAdmins(adminIds, type, title, message, parcel._id);
  }

  return parcel;
}

module.exports = { applyStatusChange };
