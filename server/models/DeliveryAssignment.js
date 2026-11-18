const mongoose = require("mongoose");

const deliveryAssignmentSchema = new mongoose.Schema(
  {
    parcel: { type: mongoose.Schema.Types.ObjectId, ref: "Parcel", required: true },
    deliveryPersonnel: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deliveryArea: { type: String, required: true },
    dispatchDate: { type: Date, required: true, default: Date.now },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Assigned", "Completed", "Failed"], default: "Assigned" },
  },
  { timestamps: true }
);

deliveryAssignmentSchema.index({ parcel: 1 });
deliveryAssignmentSchema.index({ deliveryPersonnel: 1 });

module.exports = mongoose.model("DeliveryAssignment", deliveryAssignmentSchema);
