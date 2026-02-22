const User = require("../models/User")

const resetWeeklyLeaderboard = async () => {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  await User.updateMany(
    { lastWeeklyReset: { $lt: startOfWeek } },
    {
      $set: {
        weeklyXp: 0,
        lastWeeklyReset: now
      }
    }
  )

  console.log("Weekly leaderboard reset executed")
}

module.exports = { resetWeeklyLeaderboard }