const express = require("express")
const { auth } = require("../middleware/auth")
const Activity = require("../models/Activity")
const { getCache, setCache } = require("../utils/cache")
const { ApiResponse } = require("../utils/apiResponse")
const { getUserActivities, getActivityStats, ACTIVITY_TYPES } = require("../services/activityLogger")

const router = express.Router()

// @route   GET /api/activity
// @desc    Get last 20 activities for the authenticated user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id
    const limit = parseInt(req.query.limit) || 20
    const skip = parseInt(req.query.skip) || 0

    const cacheKey = `activity_${userId}_${limit}_${skip}`

    const cachedData = getCache(cacheKey)
    if (cachedData) {
      return res.json(
        new ApiResponse(200, cachedData, "Activities retrieved (cached)").toJSON()
      )
    }

    const activities = await getUserActivities(userId, limit, skip)
    const total = await Activity.countDocuments({ user: userId })

    const data = {
      activities,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    }

    setCache(cacheKey, data)

    return res.json(
      new ApiResponse(200, data, "Activities retrieved").toJSON()
    )
  } catch (error) {
    console.error("Get activity feed error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

// @route   GET /api/activity/feed
// @desc    Get recent activity feed (last 10)
// @access  Private
router.get("/feed", auth, async (req, res) => {
  try {
    const userId = req.user._id

    const cacheKey = `activity_feed_${userId}`
    const cachedData = getCache(cacheKey)
    if (cachedData) {
      return res.json(
        new ApiResponse(200, cachedData, "Activity feed retrieved (cached)").toJSON()
      )
    }

    const activities = await getUserActivities(userId, 10, 0)

    setCache(cacheKey, activities)

    return res.json(
      new ApiResponse(200, activities, "Activity feed retrieved").toJSON()
    )
  } catch (error) {
    console.error("Get activity feed error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

// @route   GET /api/activity/stats
// @desc    Get activity statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id

    const stats = await getActivityStats(userId)

    return res.json(
      new ApiResponse(200, stats, "Activity statistics retrieved").toJSON()
    )
  } catch (error) {
    console.error("Get activity stats error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

// @route   GET /api/activity/type/:type
// @desc    Get activities of specific type
// @access  Private
router.get("/type/:type", auth, async (req, res) => {
  try {
    const userId = req.user._id
    const { type } = req.params
    const limit = parseInt(req.query.limit) || 10

    // Validate activity type
    const validTypes = Object.values(ACTIVITY_TYPES)
    if (!validTypes.includes(type)) {
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid activity type").toJSON()
      )
    }

    const activities = await Activity.find({
      user: userId,
      type,
    })
      .sort({ createdAt: -1 })
      .limit(limit)

    return res.json(
      new ApiResponse(200, activities, `Activities of type '${type}' retrieved`).toJSON()
    )
  } catch (error) {
    console.error("Get activities by type error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

module.exports = router
