const mongoose = require("mongoose");

const STATUSES = ["Booked", "Dispatched", "In Transit", "Out for Delivery", "Delivered", "Returned", "Cancelled"];

const parcelSchema = new mongoose.Schema(
  {
    trackingNumber: { type: String, required: true, unique: true },

    sender: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    receiver: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
    },

    category: { type: String, required: true },
    description: String,
    weight: { type: Number, required: true },

    bookingDate: { type: Date, required: true, default: Date.now },
    deliveryCharges: { type: Number, required: true, default: 0 },
    paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    paymentMethod: { type: String, enum: ["Cash", "UPI", "Bank Transfer", "Card", "Other"], required: true },

    status: { type: String, enum: STATUSES, default: "Booked" },
    expectedDeliveryDate: Date,
    deliveredAt: Date,
    failureReason: String,
    deliveryRemarks: String,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

parcelSchema.index({ "sender.name": "text", "receiver.name": "text" });

module.exports = mongoose.model("Parcel", parcelSchema);
module.exports.STATUSES = STATUSES;
