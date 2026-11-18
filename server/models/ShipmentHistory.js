const mongoose = require("mongoose");

const shipmentHistorySchema = new mongoose.Schema(
  {
    parcel: { type: mongoose.Schema.Types.ObjectId, ref: "Parcel", required: true },
    status: { type: String, required: true },
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

shipmentHistorySchema.index({ parcel: 1, createdAt: 1 });

module.exports = mongoose.model("ShipmentHistory", shipmentHistorySchema);
