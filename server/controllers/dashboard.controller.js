const User = require("../models/User")

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id

    const user = await User.findById(userId)
      .select(
        "xp level enrolledCourses coursesCompleted totalLearningHours currentStreak longestStreak badges skills"
      )
      .populate("enrolledCourses.course", "title category")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const dashboard = {
      stats: {
        totalXP: user.xp,
        level: user.level,
        coursesEnrolled: user.enrolledCourses.length,
        coursesCompleted: user.coursesCompleted,
        totalLearningHours: user.totalLearningHours,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        badgesEarned: user.badges.length,
        skillsLearned: user.skills.length,
      },
      recentCourses: user.enrolledCourses.slice(0, 3).map((c) => ({
        id: c.course?._id,
        title: c.course?.title,
        category: c.course?.category,
        progress: c.progress,
      })),
    }

    res.json({
      success: true,
      data: dashboard,
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  getDashboard,
}
