const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { auth, authorize } = require("../middleware/auth")
const { getDashboard } = require("../controllers/dashboard.controller")

const router = express.Router()

/* ===========================
   PROFILE
=========================== */

// GET /api/users/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("enrolledCourses.course", "title thumbnail duration")
      .select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// GET /api/users/me/enrolled-courses
router.get("/me/enrolled-courses", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("enrolledCourses.course")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const courses = user.enrolledCourses.map(ec => {
      const totalLessons = ec.course?.totalLessons || 0
      const completedLessonsCount = ec.completedLessons.length

      const progressPercent =
        totalLessons === 0
          ? 0
          : Math.round((completedLessonsCount / totalLessons) * 100)

      return {
        _id: ec.course._id,
        title: ec.course.title,
        level: ec.course.level,
        thumbnail: ec.course.thumbnail,

        totalLessons,
        completedLessonsCount,
        progressPercent,

        isCompleted: totalLessons > 0 && completedLessonsCount === totalLessons,
        enrolledAt: ec.enrolledAt,
        lastAccessedLesson: ec.lastAccessedLesson,
      }
    })

    res.json({
      success: true,
      courses,
    })
  } catch (error) {
    console.error("Get enrolled courses error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})


// PUT /api/users/profile
router.put(
  "/profile",
  [
    auth,
    body("firstName").optional().trim().isLength({ min: 2, max: 50 }),
    body("lastName").optional().trim().isLength({ min: 2, max: 50 }),
    body("bio").optional().isLength({ max: 500 }),
    body("location").optional().isLength({ max: 100 }),
    body("website").optional().isURL(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const allowedUpdates = [
        "firstName",
        "lastName",
        "bio",
        "location",
        "website",
        "socialLinks",
        "preferences",
      ]

      const updates = {}
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key]
        }
      })

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      }).select("-password")

      res.json({
        success: true,
        message: "Profile updated successfully",
        user,
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  }
)





/* ===========================
   DASHBOARD
=========================== */

// GET /api/users/dashboard
router.get("/dashboard", auth, getDashboard)

/* ===========================
   AVATAR
=========================== */

// POST /api/users/avatar
router.post("/avatar", auth, async (req, res) => {
  try {
    const { avatar } = req.body

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: "Avatar URL is required",
      })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true }
    ).select("-password")

    res.json({
      success: true,
      message: "Avatar updated successfully",
      user,
    })
  } catch (error) {
    console.error("Update avatar error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

/* ===========================
   LEADERBOARD
=========================== */

// GET /api/users/leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query

    const users = await User.find({ isActive: true })
      .select("firstName lastName avatar xp level badges coursesCompleted")
      .sort({ xp: -1, level: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments({ isActive: true })

    res.json({
      success: true,
      users,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get leaderboard error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

/* ===========================
   XP SYSTEM
=========================== */

// POST /api/users/add-xp
router.post("/add-xp", auth, async (req, res) => {
  try {
    const { points, reason } = req.body

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid points amount is required",
      })
    }

    const user = await User.findById(req.user._id)
    const oldLevel = user.level

    user.xp += points
    await user.save()

    res.json({
      success: true,
      message: `Added ${points} XP${reason ? ` for ${reason}` : ""}`,
      xp: user.xp,
      level: user.level,
      leveledUp: user.level > oldLevel,
    })
  } catch (error) {
    console.error("Add XP error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

/* ===========================
   ADMIN
=========================== */

// GET /api/users (Admin)
router.get("/", [auth, authorize("admin")], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments()

    res.json({
      success: true,
      users,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
