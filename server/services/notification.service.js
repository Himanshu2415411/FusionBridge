const Notification = require("../models/Notification")

async function createNotification(userId, type, message) {
  await Notification.create({ user: userId, type, message })
}

module.exports = { createNotification }
