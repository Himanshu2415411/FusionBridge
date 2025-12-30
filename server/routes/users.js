const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
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

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
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

      const allowedUpdates = ["firstName", "lastName", "bio", "location", "website", "socialLinks", "preferences"]

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
  },
)

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post("/avatar", auth, async (req, res) => {
  try {
    const { avatar } = req.body

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: "Avatar URL is required",
      })
    }

    const user = await User.findByIdAndUpdate(req.user._id, { avatar }, { new: true }).select("-password")

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

// @route   GET /api/users/leaderboard
// @desc    Get user leaderboard
// @access  Public
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
        current: page,
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

// @route   POST /api/users/add-xp
// @desc    Add XP to user (internal use)
// @access  Private
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

    const newLevel = user.level
    const leveledUp = newLevel > oldLevel

    res.json({
      success: true,
      message: `Added ${points} XP${reason ? ` for ${reason}` : ""}`,
      xp: user.xp,
      level: user.level,
      leveledUp,
      pointsAdded: points,
    })
  } catch (error) {
    console.error("Add XP error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("enrolledCourses.course", "title category")

    const stats = {
      totalXP: user.xp,
      currentLevel: user.level,
      coursesEnrolled: user.enrolledCourses.length,
      coursesCompleted: user.coursesCompleted,
      totalLearningHours: user.totalLearningHours,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      badgesEarned: user.badges.length,
      skillsLearned: user.skills.length,
      progressToNextLevel: user.progressToNextLevel,
    }

    res.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get("/", [auth, authorize("admin")], async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query

    const query = {}

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    if (role) {
      query.role = role
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true"
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      users,
      pagination: {
        current: Number.parseInt(page),
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

// @route   GET /api/users/dashboard
// @desc    Get dashboard data
// @access  Private
router.get("/dashboard", auth, async (req, res) => {
  try {
    // 1️⃣ Fetch user
    const user = await User.findById(req.user._id)
      .populate("enrolledCourses.course", "title thumbnail")
      .select(
        "firstName lastName avatar xp level skills badges enrolledCourses coursesCompleted"
      )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // 2️⃣ Stats (cheap calculations only)
    const stats = {
      coursesEnrolled: user.enrolledCourses.length,
      coursesCompleted: user.coursesCompleted,
      skillsLearned: user.skills.length,
      totalEarnings: 0, // placeholder
      communityPosts: 0, // placeholder
      projectsCompleted: 0, // placeholder
    }

    // 3️⃣ Recent courses
    const recentCourses = user.enrolledCourses
      .slice(-3)
      .map((item) => ({
        _id: item.course?._id,
        title: item.course?.title,
        progress: item.progress,
        nextLesson: "Continue learning",
      }))

    // 4️⃣ Achievements
    const achievements = user.badges.slice(-3)

    // 5️⃣ Final response
    res.json({
      success: true,
      data: {
        stats,
        recentCourses,
        recentProjects: [],
        upcomingEvents: [],
        achievements,
      },
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    })
  }
})


// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private/Admin
router.put(
  "/:id/role",
  [auth, authorize("admin"), body("role").isIn(["student", "instructor", "admin"])],
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

      const { role } = req.body
      const userId = req.params.id

      const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password")

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      res.json({
        success: true,
        message: "User role updated successfully",
        user,
      })
    } catch (error) {
      console.error("Update user role error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   PUT /api/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private/Admin
router.put("/:id/status", [auth, authorize("admin"), body("isActive").isBoolean()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { isActive } = req.body
    const userId = req.params.id

    const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user,
    })
  } catch (error) {
    console.error("Update user status error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
