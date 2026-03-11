const express = require("express")
const { auth } = require("../middleware/auth")
const Activity = require("../models/Activity")

const router = express.Router()

// @route   GET /api/activity
// @desc    Get last 20 activities for the authenticated user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)

    res.json({ success: true, data: activities })
  } catch (error) {
    console.error("Get activity feed error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

module.exports = router
