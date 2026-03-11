const User = require("../models/User")
const CareerProfile = require("../models/CareerProfile")
const FreelanceProject = require("../models/FreelanceProject")
const Activity = require("../models/Activity")
const Notification = require("../models/Notification")
const { getPaginationParams } = require("../utils/pagination")
const { getCache, setCache } = require("../utils/cache")

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

const getLeaderboard = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query)

    const users = await User.find({})
      .sort({ weeklyXP: -1 })
      .skip(skip)
      .limit(limit)
      .select("firstName lastName avatar weeklyXP xp")

    const totalUsers = await User.countDocuments()

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(totalUsers / limit),
      leaderboard: users,
    })
  } catch (error) {
    console.error("Leaderboard error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user._id
    const cacheKey = `dashboard_${userId}`

    const cachedData = getCache(cacheKey)
    if (cachedData) {
      return res.json({
        success: true,
        dashboard: cachedData,
        cached: true,
      })
    }

    const [user, profile, projects, recentActivities, unreadNotifications] =
      await Promise.all([
        User.findById(userId).select("xp currentStreak enrolledCourses"),
        CareerProfile.findOne({ user: userId }).select("skills targetRole"),
        FreelanceProject.find({ user: userId }).select("status"),
        Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
        Notification.countDocuments({ user: userId, read: false }),
      ])

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const completedLessons = (user.enrolledCourses || []).reduce(
      (sum, ec) => sum + (ec.completedLessons?.length || 0),
      0
    )

    const activeProjects = projects.filter(
      (p) => p.status === "planning" || p.status === "in-progress"
    ).length
    const completedProjects = projects.filter(
      (p) => p.status === "completed"
    ).length

    const dashboardData = {
      xp: user.xp || 0,
      streak: user.currentStreak || 0,
      enrolledCourses: (user.enrolledCourses || []).length,
      completedLessons,
      targetRole: profile?.targetRole || null,
      skills: profile?.skills || [],
      activeProjects,
      completedProjects,
      unreadNotifications,
      recentActivities,
    }

    setCache(cacheKey, dashboardData)

    res.json({
      success: true,
      dashboard: dashboardData,
      cached: false,
    })
  } catch (error) {
    console.error("Dashboard overview error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

module.exports = {
  getDashboard,
  getLeaderboard,
  getDashboardOverview,
}

