const Notification = require("../models/Notification");

async function listNotifications(req, res) {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ notifications, unreadCount });
}

async function markRead(req, res) {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  notification.isRead = true;
  await notification.save();
  res.json({ notification });
}

module.exports = { listNotifications, markRead };
