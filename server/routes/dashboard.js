const express = require("express")
const { auth } = require("../middleware/auth")
const User = require("../models/User")
const { getDashboardOverview } = require("../controllers/dashboard.controller")
const { ApiResponse } = require("../utils/apiResponse")

const router = express.Router()

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id

    const user = await User.findById(userId)
      .select(
        "xp level enrolledCourses coursesCompleted totalLearningHours currentStreak longestStreak badges skills"
      )
      .populate("enrolledCourses.course", "title category")

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, null, "User not found").toJSON()
      )
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

    res.json(
      new ApiResponse(200, dashboard, "Dashboard fetched successfully").toJSON()
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/dashboard/overview
// @desc    Aggregated dashboard metrics for the authenticated user
// @access  Private
router.get("/overview", auth, getDashboardOverview)

module.exports = router
