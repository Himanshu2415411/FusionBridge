const express = require("express")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalUsers: 1247,
    totalCourses: 89,
    totalProjects: 156,
    totalRevenue: 45670,
    growthRate: 12.5,
  },
  userStats: {
    newUsersThisMonth: 89,
    activeUsers: 456,
    userRetention: 78.5,
    averageSessionTime: "24m 35s",
  },
  courseStats: {
    totalEnrollments: 3456,
    completionRate: 67.8,
    averageRating: 4.6,
    popularCategories: [
      { name: "Web Development", count: 45 },
      { name: "Data Science", count: 32 },
      { name: "Mobile Development", count: 28 },
      { name: "Design", count: 24 },
    ],
  },
  revenueData: [
    { month: "Jan", revenue: 4200, users: 120 },
    { month: "Feb", revenue: 4800, users: 145 },
    { month: "Mar", revenue: 5200, users: 167 },
    { month: "Apr", revenue: 4900, users: 189 },
    { month: "May", revenue: 5600, users: 203 },
    { month: "Jun", revenue: 6100, users: 234 },
  ],
  userActivity: [
    { day: "Mon", active: 234 },
    { day: "Tue", active: 267 },
    { day: "Wed", active: 289 },
    { day: "Thu", active: 312 },
    { day: "Fri", active: 298 },
    { day: "Sat", active: 189 },
    { day: "Sun", active: 156 },
  ],
}

// @route   GET /api/analytics/overview
// @desc    Get platform overview analytics
// @access  Private/Admin
router.get("/overview", [auth, authorize("admin")], async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAnalytics.overview,
    })
  } catch (error) {
    console.error("Get overview analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/analytics/users
// @desc    Get user analytics
// @access  Private/Admin
router.get("/users", [auth, authorize("admin")], async (req, res) => {
  try {
    const { period = "month" } = req.query

    res.json({
      success: true,
      data: {
        ...mockAnalytics.userStats,
        activity: mockAnalytics.userActivity,
        period,
      },
    })
  } catch (error) {
    console.error("Get user analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/analytics/courses
// @desc    Get course analytics
// @access  Private/Admin
router.get("/courses", [auth, authorize("admin")], async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAnalytics.courseStats,
    })
  } catch (error) {
    console.error("Get course analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics
// @access  Private/Admin
router.get("/revenue", [auth, authorize("admin")], async (req, res) => {
  try {
    const { period = "6months" } = req.query

    res.json({
      success: true,
      data: {
        total: mockAnalytics.overview.totalRevenue,
        growth: mockAnalytics.overview.growthRate,
        chartData: mockAnalytics.revenueData,
        period,
      },
    })
  } catch (error) {
    console.error("Get revenue analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics for instructors
// @access  Private/Instructor
router.get("/dashboard", [auth, authorize("instructor", "admin")], async (req, res) => {
  try {
    // Mock instructor-specific analytics
    const instructorAnalytics = {
      totalStudents: 234,
      totalCourses: 8,
      totalRevenue: 12450,
      averageRating: 4.7,
      coursePerformance: [
        { course: "React Fundamentals", students: 89, rating: 4.8, revenue: 3200 },
        { course: "Advanced JavaScript", students: 67, rating: 4.6, revenue: 2800 },
        { course: "Node.js Basics", students: 78, rating: 4.9, revenue: 3450 },
      ],
      monthlyEarnings: [
        { month: "Jan", amount: 2100 },
        { month: "Feb", amount: 2400 },
        { month: "Mar", amount: 2800 },
        { month: "Apr", amount: 2200 },
        { month: "May", amount: 3100 },
      ],
    }

    res.json({
      success: true,
      data: instructorAnalytics,
    })
  } catch (error) {
    console.error("Get instructor dashboard error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/analytics/student-progress
// @desc    Get student progress analytics
// @access  Private
router.get("/student-progress", auth, async (req, res) => {
  try {
    // Mock student progress analytics
    const studentProgress = {
      totalXP: 2450,
      level: 12,
      coursesCompleted: 5,
      coursesInProgress: 3,
      averageScore: 87.5,
      weeklyActivity: [
        { day: "Mon", hours: 2.5, xp: 150 },
        { day: "Tue", hours: 1.8, xp: 120 },
        { day: "Wed", hours: 3.2, xp: 200 },
        { day: "Thu", hours: 2.1, xp: 140 },
        { day: "Fri", hours: 2.8, xp: 180 },
        { day: "Sat", hours: 1.5, xp: 100 },
        { day: "Sun", hours: 2.0, xp: 130 },
      ],
      recentAchievements: [
        { title: "JavaScript Master", date: "2024-01-10", xp: 200 },
        { title: "Course Completion", date: "2024-01-08", xp: 150 },
        { title: "Week Streak", date: "2024-01-05", xp: 100 },
      ],
      skillProgress: [
        { skill: "JavaScript", level: 4, progress: 75 },
        { skill: "React", level: 3, progress: 60 },
        { skill: "Node.js", level: 2, progress: 40 },
        { skill: "Python", level: 3, progress: 80 },
      ],
    }

    res.json({
      success: true,
      data: studentProgress,
    })
  } catch (error) {
    console.error("Get student progress error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/analytics/platform-stats
// @desc    Get public platform statistics
// @access  Public
router.get("/platform-stats", async (req, res) => {
  try {
    const publicStats = {
      totalUsers: mockAnalytics.overview.totalUsers,
      totalCourses: mockAnalytics.overview.totalCourses,
      totalProjects: mockAnalytics.overview.totalProjects,
      coursesCompleted: 2340,
      successRate: 89.5,
      averageRating: 4.6,
      topSkills: [
        "JavaScript",
        "Python",
        "React",
        "Node.js",
        "Data Science",
        "UI/UX Design",
        "Machine Learning",
        "Mobile Development",
      ],
    }

    res.json({
      success: true,
      data: publicStats,
    })
  } catch (error) {
    console.error("Get platform stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
