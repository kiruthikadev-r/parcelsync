const DeliveryAssignment = require("../models/DeliveryAssignment");
const { applyStatusChange } = require("../services/shipmentService");

const PROGRESS_STATUSES = ["In Transit", "Out for Delivery"];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

async function listMyAssignments(req, res) {
  const assignments = await DeliveryAssignment.find({ deliveryPersonnel: req.user._id, status: "Assigned" })
    .sort({ dispatchDate: 1 })
    .populate("parcel");
  res.json({ assignments });
}

async function listTodayAssignments(req, res) {
  const assignments = await DeliveryAssignment.find({
    deliveryPersonnel: req.user._id,
    status: "Assigned",
    dispatchDate: { $gte: startOfToday(), $lte: endOfToday() },
  }).populate("parcel");
  res.json({ assignments });
}

async function listCompletedAssignments(req, res) {
  const assignments = await DeliveryAssignment.find({
    deliveryPersonnel: req.user._id,
    status: { $in: ["Completed", "Failed"] },
  })
    .sort({ updatedAt: -1 })
    .populate("parcel");
  res.json({ assignments });
}

async function searchMyAssignments(req, res) {
  const { trackingNumber } = req.query;
  if (!trackingNumber) return res.status(400).json({ message: "trackingNumber query param is required" });

  const assignments = await DeliveryAssignment.find({ deliveryPersonnel: req.user._id })
    .populate({ path: "parcel", match: { trackingNumber: { $regex: trackingNumber, $options: "i" } } });
  res.json({ assignments: assignments.filter((a) => a.parcel) });
}

async function updateDeliveryStatus(req, res) {
  const { status, reason, remarks } = req.body;
  const allowed = [...PROGRESS_STATUSES, "Delivered", "Failed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
  }
  if (status === "Failed" && !reason) {
    return res.status(400).json({ message: "A reason is required when marking a delivery as failed" });
  }

  const assignment = await DeliveryAssignment.findOne({ _id: req.params.id, deliveryPersonnel: req.user._id }).populate("parcel");
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });
  if (assignment.status !== "Assigned") {
    return res.status(400).json({ message: "This assignment has already been completed" });
  }

  if (status === "Delivered") {
    await applyStatusChange({ parcel: assignment.parcel, status: "Delivered", note: remarks, updatedBy: req.user._id });
    assignment.status = "Completed";
  } else if (status === "Failed") {
    await applyStatusChange({ parcel: assignment.parcel, status: "Returned", note: reason, updatedBy: req.user._id });
    assignment.status = "Failed";
  } else {
    await applyStatusChange({ parcel: assignment.parcel, status, note: remarks, updatedBy: req.user._id });
  }
  await assignment.save();

  res.json({ assignment });
}

module.exports = { listMyAssignments, listTodayAssignments, listCompletedAssignments, searchMyAssignments, updateDeliveryStatus };
