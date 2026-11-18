const Notification = require("../models/Notification");

async function notify(userId, type, title, message, relatedParcel) {
  return Notification.create({ user: userId, type, title, message, relatedParcel });
}

async function notifyAdmins(adminIds, type, title, message, relatedParcel) {
  return Notification.insertMany(
    adminIds.map((id) => ({ user: id, type, title, message, relatedParcel }))
  );
}

module.exports = { notify, notifyAdmins };
