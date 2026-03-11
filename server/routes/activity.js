const express = require("express")
const { auth } = require("../middleware/auth")
const Activity = require("../models/Activity")
const { getCache, setCache } = require("../utils/cache")

const router = express.Router()

// @route   GET /api/activity
// @desc    Get last 20 activities for the authenticated user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const cacheKey = `activity_${req.user._id}`

    const cachedData = getCache(cacheKey)
    if (cachedData) {
      return res.json({ success: true, data: cachedData, cached: true })
    }

    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)

    setCache(cacheKey, activities)

    res.json({ success: true, data: activities, cached: false })
  } catch (error) {
    console.error("Get activity feed error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

module.exports = router
