const User = require("../models/User");
const { signToken } = require("../utils/jwt");

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    username: user.username,
    assignedArea: user.assignedArea,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "email and password are required" });

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (!user.isActive) return res.status(403).json({ message: "Your account has been deactivated" });

  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
}

async function me(req, res) {
  res.json({ user: toPublicUser(req.user) });
}

async function updateProfile(req, res) {
  const allowed = ["name", "phone", "address"];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true });
  res.json({ user: toPublicUser(user) });
}

module.exports = { login, me, updateProfile, toPublicUser };
