const express = require("express")
const Course = require("../models/Course")
const User = require("../models/User")
const QuizAttempt = require("../models/QuizAttempt")
const { auth, authorize } = require("../middleware/auth")
const { getPaginationParams } = require("../utils/pagination")
const { resetWeeklyXP } = require("../utils/weeklyReset")
const { ApiResponse } = require("../utils/apiResponse")

const router = express.Router()

/* =========================================================
   GET /api/analytics/overview
   Platform-wide overview (Admin)
========================================================= */
router.get("/overview", [auth, authorize("admin")], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalCourses = await Course.countDocuments()
    const totalPublishedCourses = await Course.countDocuments({ isPublished: true })

    const totalEnrollments = await User.aggregate([
      { $unwind: "$enrolledCourses" },
      { $count: "count" }
    ])

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalPublishedCourses,
        totalEnrollments: totalEnrollments[0]?.count || 0,
      }
    })

  } catch (error) {
    console.error("Overview analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

/* =========================================================
   GET /api/analytics/courses
   Course analytics (Admin)
========================================================= */
router.get("/courses", [auth, authorize("admin")], async (req, res) => {
  try {
    const courses = await Course.find().select(
      "title studentsEnrolled averageRating"
    )

    const totalCourses = courses.length

    const totalEnrollments = courses.reduce(
      (sum, c) => sum + (c.studentsEnrolled || 0),
      0
    )

    const averageRating =
      totalCourses === 0
        ? 0
        : Math.round(
            courses.reduce((sum, c) => sum + c.averageRating, 0) /
              totalCourses
          )

    res.json({
      success: true,
      data: {
        totalCourses,
        totalEnrollments,
        averageRating,
      }
    })

  } catch (error) {
    console.error("Course analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

/* =========================================================
   GET /api/analytics/student-progress
   Logged-in student analytics
========================================================= */
router.get("/student-progress", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    const totalXP = user.xp
    const level = user.level
    const coursesCompleted = user.coursesCompleted || 0
    const coursesInProgress = user.enrolledCourses.filter(
      ec => !ec.isCourseCompleted
    ).length

    let totalScore = 0
    let totalAttempts = 0

    user.enrolledCourses.forEach(ec => {
      if (ec.quizAttempts && ec.quizAttempts.length > 0) {
        ec.quizAttempts.forEach(attempt => {
          totalScore += attempt.percentage
          totalAttempts++
        })
      }
    })

    const averageScore =
      totalAttempts === 0
        ? 0
        : Math.round(totalScore / totalAttempts)

    res.json({
      success: true,
      data: {
        totalXP,
        level,
        coursesCompleted,
        coursesInProgress,
        averageScore,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        badges: user.badges,
      }
    })

  } catch (error) {
    console.error("Student analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

/* =========================================================
   GET /api/analytics/dashboard
   Instructor Dashboard
========================================================= */
router.get("/dashboard", [auth, authorize("instructor", "admin")], async (req, res) => {
  try {
    const instructorId = req.user._id

    const courses = await Course.find({ instructor: instructorId })

    let totalStudents = 0
    let totalRating = 0

    courses.forEach(course => {
      totalStudents += course.studentsEnrolled || 0
      totalRating += course.averageRating || 0
    })

    const averageRating =
      courses.length === 0
        ? 0
        : Math.round(totalRating / courses.length)

    res.json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalStudents,
        averageRating,
        totalRevenue: 0 // placeholder until payment system exists
      }
    })

  } catch (error) {
    console.error("Instructor dashboard error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

/* =========================================================
   GET /api/analytics/platform-stats
   Public platform statistics
========================================================= */
router.get("/platform-stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalCourses = await Course.countDocuments()
    const totalQuizAttempts = await QuizAttempt.countDocuments()
    const activeLearners = await User.countDocuments({
      "enrolledCourses.0": { $exists: true }
    })

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        activeLearners,
        totalQuizAttempts
      }
    })

  } catch (error) {
    console.error("Platform stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

/* =========================================================
   GET /api/analytics/leaderboard
   Top users by XP
========================================================= */
router.get("/leaderboard", async (req, res) => {
  try {
    // Get pagination parameters
    const { page, limit, skip } = getPaginationParams(req.query)

    const users = await User.find()
      .select("firstName lastName avatar weeklyXp")
      .sort({ weeklyXp: -1 })
      .skip(skip)
      .limit(limit)

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      weeklyXp: user.weeklyXp,
    }))

    const totalUsers = await User.countDocuments()
    const totalPages = Math.ceil(totalUsers / limit)

    res.json({
      success: true,
      page,
      totalPages,
      leaderboard,
    })

  } catch (error) {
    console.error("Leaderboard error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

/* =========================================================
   GET /api/analytics/recommendations
   Smart course recommendations
========================================================= */
router.get("/recommendations", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const enrolledCourseIds = user.enrolledCourses.map(ec =>
      ec.course.toString()
    )

    // Get categories of enrolled courses
    const enrolledCourses = await Course.find({
      _id: { $in: enrolledCourseIds }
    }).select("category")

    const preferredCategories = [
      ...new Set(enrolledCourses.map(c => c.category))
    ]

    // Recommend courses in same category
    const recommended = await Course.find({
      isPublished: true,
      _id: { $nin: enrolledCourseIds },
      category: { $in: preferredCategories }
    })
      .sort({ averageRating: -1, studentsEnrolled: -1 })
      .limit(6)
      .populate("instructor", "firstName lastName avatar")

    res.json({
      success: true,
      data: recommended
    })

  } catch (error) {
    console.error("Recommendation error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

router.get("/learning-roadmap", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    const enrolledCourseIds = user.enrolledCourses.map(
      ec => ec.course.toString()
    )

    const enrolledCourses = await Course.find({
      _id: { $in: enrolledCourseIds }
    }).select("category level")

    if (enrolledCourses.length === 0) {
      return res.json({
        success: true,
        data: {
          message: "Start with a beginner course to generate roadmap."
        }
      })
    }

    const categories = [...new Set(enrolledCourses.map(c => c.category))]

    const levelOrder = ["beginner", "intermediate", "advanced"]

    let highestLevelIndex = 0

    enrolledCourses.forEach(course => {
      const index = levelOrder.indexOf(course.level)
      if (index > highestLevelIndex) {
        highestLevelIndex = index
      }
    })

    const nextLevel =
      levelOrder[highestLevelIndex + 1] || null

    let recommended = []

    if (nextLevel) {
      recommended = await Course.find({
        isPublished: true,
        category: { $in: categories },
        level: nextLevel,
        _id: { $nin: enrolledCourseIds }
      })
        .sort({ averageRating: -1, studentsEnrolled: -1 })
        .limit(5)
    }

    res.json({
      success: true,
      data: {
        currentLevel: levelOrder[highestLevelIndex],
        nextLevel,
        recommendedCourses: recommended
      }
    })

  } catch (error) {
    console.error("Roadmap error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

router.post("/reset-weekly-xp", async (req, res) => {
  try {
    await resetWeeklyXP()

    res.json({
      success: true,
      message: "Weekly XP leaderboard reset successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Reset failed"
    })
  }
})

/* =========================================================
   GET /api/analytics/course-completion
   Overall course completion rate
========================================================= */
router.get("/course-completion", async (req, res) => {
  try {
    const users = await User.find().select("enrolledCourses")

    let totalEnrollments = 0
    let completedCourses = 0

    users.forEach(user => {
      user.enrolledCourses.forEach(ec => {
        totalEnrollments++
        if (ec.progress === 100) {
          completedCourses++
        }
      })
    })

    const completionRate =
      totalEnrollments === 0
        ? 0
        : Math.round((completedCourses / totalEnrollments) * 100)

    res.json({
      success: true,
      completionRate,
      totalEnrollments,
      completedCourses
    })

  } catch (error) {
    console.error("Course completion error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

/* =========================================================
   GET /api/analytics/hardest-quizzes
   Top 5 lessons with lowest average quiz score
========================================================= */
router.get("/hardest-quizzes", async (req, res) => {
  try {
    const hardestQuizzes = await QuizAttempt.aggregate([
      {
        $group: {
          _id: "$lesson",
          averageScore: { $avg: "$score" },
          totalAttempts: { $sum: 1 }
        }
      },
      { $sort: { averageScore: 1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          lesson: "$_id",
          averageScore: { $round: ["$averageScore", 2] },
          totalAttempts: 1
        }
      }
    ])

    res.json({
      success: true,
      hardestQuizzes
    })

  } catch (error) {
    console.error("Hardest quizzes error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

/* =========================================================
   GET /api/analytics/weekly-active
   Count of users active in the last 7 days
========================================================= */
router.get("/weekly-active", async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const weeklyActiveUsers = await User.countDocuments({
      updatedAt: { $gte: sevenDaysAgo }
    })

    res.json({
      success: true,
      weeklyActiveUsers
    })

  } catch (error) {
    console.error("Weekly active users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

module.exports = router