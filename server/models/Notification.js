const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "parcel_booked",
        "parcel_dispatched",
        "parcel_assigned",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "delivery_failed",
      ],
      required: true,
    },
    relatedParcel: { type: mongoose.Schema.Types.ObjectId, ref: "Parcel" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
