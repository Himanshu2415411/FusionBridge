const express = require('express')
const User = require('../models/User')
const { optionalAuth } = require('../middleware/auth')
const { ApiResponseWithPagination } = require('../utils/apiResponse')
const router = express.Router()

/**
 * GET /api/leaderboard
 * Global leaderboard ranked by XP
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query

    // Validate limits
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100)
    const skip = (pageNum - 1) * limitNum

    // Get users ranked by XP
    const users = await User.find({}, 'firstName lastName avatar xp badges currentStreak longestStreak')
      .sort({ xp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()

    // Add computed fields
    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      xp: user.xp,
      level: Math.floor(user.xp / 1000) + 1,
      badgesCount: user.badges.length,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
    }))

    // Get total count
    const totalUsers = await User.countDocuments()
    const totalPages = Math.ceil(totalUsers / limitNum)

    // Find current user's rank if authenticated
    let userRank = null
    if (req.user) {
      const userXp = await User.findById(req.user._id).select('xp').lean()
      if (userXp) {
        const higherXp = await User.countDocuments({ xp: { $gt: userXp.xp } })
        userRank = higherXp + 1
      }
    }

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: totalUsers,
      totalPages,
      hasMore: pageNum < totalPages,
    }

    const response = {
      leaderboard,
      userRank,
      pagination,
    }

    res.status(200).json(
      new ApiResponseWithPagination(
        200,
        response,
        pagination,
        'Leaderboard fetched successfully'
      )
    )
  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      data: null,
    })
  }
})

/**
 * GET /api/leaderboard/level
 * Leaderboard ranked by level, then XP
 */
router.get('/level', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query

    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100)
    const skip = (pageNum - 1) * limitNum

    // Get users with aggregation for level calculation
    const users = await User.aggregate([
      {
        $project: {
          firstName: 1,
          lastName: 1,
          avatar: 1,
          xp: 1,
          badges: { $size: '$badges' },
          currentStreak: { $ifNull: ['$currentStreak', 0] },
          longestStreak: { $ifNull: ['$longestStreak', 0] },
          level: {
            $add: [{ $floor: { $divide: ['$xp', 1000] } }, 1],
          },
        },
      },
      { $sort: { level: -1, xp: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    ])

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      xp: user.xp,
      level: user.level,
      badgesCount: user.badges,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    }))

    const totalUsers = await User.countDocuments()
    const totalPages = Math.ceil(totalUsers / limitNum)

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: totalUsers,
      totalPages,
    }

    res.status(200).json(
      new ApiResponseWithPagination(
        200,
        leaderboard,
        pagination,
        'Level leaderboard fetched successfully'
      )
    )
  } catch (error) {
    console.error('Level leaderboard error:', error)
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      data: null,
    })
  }
})

/**
 * GET /api/leaderboard/badges
 * Leaderboard ranked by badge count
 */
router.get('/badges', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query

    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100)
    const skip = (pageNum - 1) * limitNum

    const users = await User.aggregate([
      {
        $project: {
          firstName: 1,
          lastName: 1,
          avatar: 1,
          xp: 1,
          badgesCount: { $size: '$badges' },
          level: { $add: [{ $floor: { $divide: ['$xp', 1000] } }, 1] },
        },
      },
      { $sort: { badgesCount: -1, xp: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    ])

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      badgesCount: user.badgesCount,
      xp: user.xp,
      level: user.level,
    }))

    const totalUsers = await User.countDocuments()
    const totalPages = Math.ceil(totalUsers / limitNum)

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: totalUsers,
      totalPages,
    }

    res.status(200).json(
      new ApiResponseWithPagination(
        200,
        leaderboard,
        pagination,
        'Badge leaderboard fetched successfully'
      )
    )
  } catch (error) {
    console.error('Badge leaderboard error:', error)
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      data: null,
    })
  }
})

/**
 * GET /api/leaderboard/streaks
 * Leaderboard ranked by current streak
 */
router.get('/streaks', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query

    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100)
    const skip = (pageNum - 1) * limitNum

    const users = await User.aggregate([
      {
        $project: {
          firstName: 1,
          lastName: 1,
          avatar: 1,
          currentStreak: { $ifNull: ['$currentStreak', 0] },
          longestStreak: { $ifNull: ['$longestStreak', 0] },
          xp: 1,
          level: { $add: [{ $floor: { $divide: ['$xp', 1000] } }, 1] },
        },
      },
      { $sort: { currentStreak: -1, longestStreak: -1, xp: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    ])

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      xp: user.xp,
      level: user.level,
    }))

    const totalUsers = await User.countDocuments()
    const totalPages = Math.ceil(totalUsers / limitNum)

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: totalUsers,
      totalPages,
    }

    res.status(200).json(
      new ApiResponseWithPagination(
        200,
        leaderboard,
        pagination,
        'Streak leaderboard fetched successfully'
      )
    )
  } catch (error) {
    console.error('Streak leaderboard error:', error)
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      data: null,
    })
  }
})

/**
 * GET /api/leaderboard/weekly
 * Weekly leaderboard (top users by XP gained this week)
 */
router.get('/weekly', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query

    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100)
    const skip = (pageNum - 1) * limitNum

    // Get users with XP gained in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const users = await User.aggregate([
      {
        $project: {
          firstName: 1,
          lastName: 1,
          avatar: 1,
          xp: 1,
          level: { $add: [{ $floor: { $divide: ['$xp', 1000] } }, 1] },
          recentXp: {
            $sum: {
              $cond: [
                { $gte: ['$enrolledCourses.lastActivityDate', sevenDaysAgo] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { recentXp: -1, xp: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    ])

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      xp: user.xp,
      level: user.level,
      recentXp: user.recentXp,
    }))

    const totalUsers = await User.countDocuments()
    const totalPages = Math.ceil(totalUsers / limitNum)

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: totalUsers,
      totalPages,
    }

    res.status(200).json(
      new ApiResponseWithPagination(
        200,
        leaderboard,
        pagination,
        'Weekly leaderboard fetched successfully'
      )
    )
  } catch (error) {
    console.error('Weekly leaderboard error:', error)
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      data: null,
    })
  }
})

/**
 * GET /api/leaderboard/nearby
 * Users ranked near current user
 */
router.get('/nearby', require('../middleware/auth').auth, async (req, res) => {
  try {
    const { range = 5 } = req.query
    const rangeNum = Math.min(parseInt(range), 20)

    // Find current user's rank
    const currentUser = await User.findById(req.user._id).select('xp').lean()

    const userRank = await User.countDocuments({ xp: { $gt: currentUser.xp } })

    const startIndex = Math.max(0, userRank - rangeNum)
    const skipAmount = startIndex
    const limitAmount = rangeNum * 2 + 1

    const nearbyUsers = await User.find({}, 'firstName lastName avatar xp badges')
      .sort({ xp: -1 })
      .skip(skipAmount)
      .limit(limitAmount)
      .lean()

    const leaderboard = nearbyUsers.map((user, index) => ({
      rank: skipAmount + index + 1,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      xp: user.xp,
      level: Math.floor(user.xp / 1000) + 1,
      badgesCount: user.badges.length,
      isCurrentUser: user._id.toString() === req.user._id.toString(),
    }))

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        leaderboard,
        currentUserRank: userRank + 1,
      },
      message: 'Nearby leaderboard fetched successfully',
    })
  } catch (error) {
    console.error('Nearby leaderboard error:', error)
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      data: null,
    })
  }
})

module.exports = router
