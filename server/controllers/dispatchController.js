const Parcel = require("../models/Parcel");
const DeliveryAssignment = require("../models/DeliveryAssignment");
const User = require("../models/User");
const { applyStatusChange } = require("../services/shipmentService");
const { notify } = require("../services/notificationService");

async function listUnassignedParcels(req, res) {
  const parcels = await Parcel.find({ status: "Booked" }).sort({ bookingDate: 1 });
  res.json({ parcels });
}

async function listAssignments(req, res) {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const assignments = await DeliveryAssignment.find(filter)
    .sort({ createdAt: -1 })
    .populate("parcel", "trackingNumber status receiver sender")
    .populate("deliveryPersonnel", "name phone assignedArea")
    .populate("assignedBy", "name");
  res.json({ assignments });
}

async function createDispatch(req, res) {
  const { parcelIds, deliveryPersonnelId, deliveryArea, dispatchDate } = req.body;
  if (!Array.isArray(parcelIds) || parcelIds.length === 0) {
    return res.status(400).json({ message: "parcelIds must be a non-empty array" });
  }
  if (!deliveryPersonnelId || !deliveryArea) {
    return res.status(400).json({ message: "deliveryPersonnelId and deliveryArea are required" });
  }

  const deliveryPerson = await User.findOne({ _id: deliveryPersonnelId, role: "delivery_personnel", isActive: true });
  if (!deliveryPerson) return res.status(404).json({ message: "Active delivery personnel not found" });

  const parcels = await Parcel.find({ _id: { $in: parcelIds }, status: "Booked" });
  if (parcels.length !== parcelIds.length) {
    return res.status(400).json({ message: "One or more parcels are not available for dispatch (already dispatched or invalid)" });
  }

  const assignments = [];
  for (const parcel of parcels) {
    const assignment = await DeliveryAssignment.create({
      parcel: parcel._id,
      deliveryPersonnel: deliveryPerson._id,
      deliveryArea,
      dispatchDate: dispatchDate || new Date(),
      assignedBy: req.user._id,
    });
    await applyStatusChange({ parcel, status: "Dispatched", updatedBy: req.user._id });
    assignments.push(assignment);
  }

  await notify(
    deliveryPerson._id,
    "parcel_assigned",
    `${assignments.length} parcel(s) assigned to you`,
    `You've been assigned ${assignments.length} parcel(s) for delivery in ${deliveryArea}.`
  );

  res.status(201).json({ assignments });
}

async function updateDispatch(req, res) {
  const assignment = await DeliveryAssignment.findById(req.params.id).populate("parcel");
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });
  if (assignment.status !== "Assigned") {
    return res.status(400).json({ message: "Only an active (not yet completed/failed) assignment can be updated" });
  }

  const { deliveryPersonnelId, deliveryArea, dispatchDate } = req.body;
  if (deliveryPersonnelId) {
    const deliveryPerson = await User.findOne({ _id: deliveryPersonnelId, role: "delivery_personnel", isActive: true });
    if (!deliveryPerson) return res.status(404).json({ message: "Active delivery personnel not found" });
    assignment.deliveryPersonnel = deliveryPerson._id;
  }
  if (deliveryArea) assignment.deliveryArea = deliveryArea;
  if (dispatchDate) assignment.dispatchDate = dispatchDate;

  await assignment.save();
  res.json({ assignment });
}

module.exports = { listUnassignedParcels, listAssignments, createDispatch, updateDispatch };
