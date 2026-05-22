const express = require("express")
const { auth } = require("../middleware/auth")
const User = require("../models/User")
const { ApiResponse } = require("../utils/apiResponse")
const {
  getAllBadges,
  getRemainingBadges,
  getBadgeDetails,
} = require("../utils/badgeEarner")

const router = express.Router()

/**
 * GET /api/badges
 * Get all available badges
 * @access Public
 */
router.get("/", async (req, res) => {
  try {
    const badges = getAllBadges()

    return res.json(
      new ApiResponse(200, badges, "All badges retrieved").toJSON()
    )
  } catch (error) {
    console.error("Get all badges error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

/**
 * GET /api/badges/user/my-badges
 * Get user's earned badges
 * @access Private
 */
router.get("/user/my-badges", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("badges")

    const formattedBadges = (user.badges || []).map((badge) => ({
      name: badge.name,
      icon: badge.icon,
      earnedAt: badge.earnedAt,
    }))

    return res.json(
      new ApiResponse(
        200,
        {
          badges: formattedBadges,
          total: formattedBadges.length,
        },
        "User badges retrieved"
      ).toJSON()
    )
  } catch (error) {
    console.error("Get user badges error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

/**
 * GET /api/badges/user/remaining
 * Get badges user hasn't earned yet
 * @access Private
 */
router.get("/user/remaining", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("badges")

    const remainingBadges = getRemainingBadges(user.badges)

    return res.json(
      new ApiResponse(
        200,
        {
          badges: remainingBadges,
          total: remainingBadges.length,
        },
        "Remaining badges retrieved"
      ).toJSON()
    )
  } catch (error) {
    console.error("Get remaining badges error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

/**
 * GET /api/badges/user/stats
 * Get badge statistics for user
 * @access Private
 */
router.get("/user/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("badges xp level")

    const earnedCount = (user.badges || []).length
    const totalCount = getAllBadges().length
    const completionPercent = Math.round((earnedCount / totalCount) * 100)

    const recentBadges = (user.badges || [])
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
      .slice(0, 5)

    return res.json(
      new ApiResponse(
        200,
        {
          earned: earnedCount,
          total: totalCount,
          completionPercent,
          recentBadges,
          xp: user.xp,
          level: user.level,
        },
        "Badge statistics retrieved"
      ).toJSON()
    )
  } catch (error) {
    console.error("Get badge stats error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

/**
 * GET /api/badges/:badgeId
 * Get specific badge details
 * @access Public
 */
router.get("/:badgeId", async (req, res) => {
  try {
    const { badgeId } = req.params

    const badge = getBadgeDetails(badgeId)

    if (!badge) {
      return res.status(404).json(
        new ApiResponse(404, null, "Badge not found").toJSON()
      )
    }

    return res.json(
      new ApiResponse(200, badge, "Badge details retrieved").toJSON()
    )
  } catch (error) {
    console.error("Get badge details error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

module.exports = router
