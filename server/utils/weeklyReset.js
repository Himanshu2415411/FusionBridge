const User = require("../models/User")

async function resetWeeklyXP() {
  await User.updateMany({}, { $set: { weeklyXP: 0 } })
  console.log("Weekly XP leaderboard reset completed")
}

module.exports = { resetWeeklyXP }