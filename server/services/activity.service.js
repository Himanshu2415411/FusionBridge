const Activity = require("../models/Activity")

async function createActivity(userId, type, message, metadata = {}) {
  const activity = await Activity.create({
    user: userId,
    type,
    message,
    metadata,
  })

  return activity
}

module.exports = { createActivity }
