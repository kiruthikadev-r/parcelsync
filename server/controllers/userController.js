const User = require("../models/User");
const DeliveryAssignment = require("../models/DeliveryAssignment");
const { toPublicUser } = require("./authController");

async function listUsers(req, res) {
  const { role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ];
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ users: users.map(toPublicUser) });
}

async function createUser(req, res) {
  const { name, email, password, role, phone, address, username, assignedArea } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "name, email, password and role are required" });
  }
  if (!["booking_staff", "delivery_personnel"].includes(role)) {
    return res.status(400).json({ message: "role must be booking_staff or delivery_personnel" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "Email already registered" });

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    address,
    username,
    assignedArea,
    createdBy: req.user._id,
  });

  res.status(201).json({ user: toPublicUser(user) });
}

async function updateUser(req, res) {
  const allowed = ["name", "phone", "address", "username", "assignedArea"];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: toPublicUser(user) });
}

async function setUserActive(req, res) {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ message: "Cannot deactivate an admin account" });

  user.isActive = !!isActive;
  await user.save();
  res.json({ user: toPublicUser(user) });
}

// Performance summary for a delivery person: assigned / completed / failed counts
async function getDeliveryPersonnelPerformance(req, res) {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "delivery_personnel") {
    return res.status(404).json({ message: "Delivery personnel not found" });
  }

  const [assigned, completed, failed] = await Promise.all([
    DeliveryAssignment.countDocuments({ deliveryPersonnel: user._id }),
    DeliveryAssignment.countDocuments({ deliveryPersonnel: user._id, status: "Completed" }),
    DeliveryAssignment.countDocuments({ deliveryPersonnel: user._id, status: "Failed" }),
  ]);

  res.json({ user: toPublicUser(user), assigned, completed, failed });
}

module.exports = { listUsers, createUser, updateUser, setUserActive, getDeliveryPersonnelPerformance };
