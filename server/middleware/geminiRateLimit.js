/**
 * Rate Limiting for Gemini API
 * Prevents abuse and manages API quota
 */

const logger = require('../utils/logger')

/**
 * Store for tracking user requests
 * Format: { userId: { count: number, resetTime: timestamp } }
 */
const userRateLimits = new Map()

/**
 * Rate limit middleware for Gemini endpoints
 * Rate limit: 20 requests per user per day (free tier)
 */
const geminiRateLimit = (req, res, next) => {
  const userId = req.user?._id

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required for AI features',
    })
  }

  const now = Date.now()
  const dailyLimitMs = 24 * 60 * 60 * 1000

  let userLimit = userRateLimits.get(userId)

  // Initialize or reset if window expired
  if (!userLimit || now - userLimit.resetTime > dailyLimitMs) {
    userLimit = {
      count: 0,
      resetTime: now,
    }
    userRateLimits.set(userId, userLimit)
  }

  // Check if limit exceeded (20 per day for free users)
  const limit = req.user.subscription === 'premium' ? 100 : 20

  if (userLimit.count >= limit) {
    const resetTime = new Date(userLimit.resetTime + dailyLimitMs)
    logger.warn(`Rate limit exceeded for user ${userId}`)

    return res.status(429).json({
      success: false,
      message: `Rate limit exceeded. Limit: ${limit}/day. Resets at: ${resetTime}`,
      retryAfter: Math.ceil((userLimit.resetTime + dailyLimitMs - now) / 1000),
    })
  }

  // Increment counter
  userLimit.count++

  // Add rate limit info to response
  res.setHeader('X-RateLimit-Limit', limit)
  res.setHeader('X-RateLimit-Remaining', limit - userLimit.count)
  res.setHeader(
    'X-RateLimit-Reset',
    Math.ceil((userLimit.resetTime + dailyLimitMs) / 1000)
  )

  logger.debug(
    `Rate limit: ${userLimit.count}/${limit} for user ${userId}`
  )

  next()
}

/**
 * Async rate limiter that checks before calling Gemini
 */
const checkGeminiRateLimit = async (userId, isPremium = false) => {
  const now = Date.now()
  const dailyLimitMs = 24 * 60 * 60 * 1000

  let userLimit = userRateLimits.get(userId)

  // Initialize or reset if window expired
  if (!userLimit || now - userLimit.resetTime > dailyLimitMs) {
    userLimit = {
      count: 0,
      resetTime: now,
    }
    userRateLimits.set(userId, userLimit)
  }

  const limit = isPremium ? 100 : 20

  if (userLimit.count >= limit) {
    const resetTime = new Date(userLimit.resetTime + dailyLimitMs)
    throw new Error(
      `Rate limit exceeded. Limit: ${limit}/day. Resets at: ${resetTime.toISOString()}`
    )
  }

  userLimit.count++
  return {
    allowed: true,
    count: userLimit.count,
    limit,
    remaining: limit - userLimit.count,
  }
}

/**
 * Get rate limit status for a user
 */
const getRateLimitStatus = (userId, isPremium = false) => {
  const now = Date.now()
  const dailyLimitMs = 24 * 60 * 60 * 1000

  let userLimit = userRateLimits.get(userId)

  if (!userLimit) {
    const limit = isPremium ? 100 : 20
    return {
      limit,
      used: 0,
      remaining: limit,
      resetTime: new Date(now + dailyLimitMs),
    }
  }

  // Check if window expired
  if (now - userLimit.resetTime > dailyLimitMs) {
    const limit = isPremium ? 100 : 20
    return {
      limit,
      used: 0,
      remaining: limit,
      resetTime: new Date(now + dailyLimitMs),
    }
  }

  const limit = isPremium ? 100 : 20
  return {
    limit,
    used: userLimit.count,
    remaining: Math.max(0, limit - userLimit.count),
    resetTime: new Date(userLimit.resetTime + dailyLimitMs),
  }
}

/**
 * Reset rate limit for a user (admin only)
 */
const resetUserRateLimit = (userId) => {
  userRateLimits.delete(userId)
  logger.info(`Rate limit reset for user ${userId}`)
}

/**
 * Clear all rate limits (for development/testing)
 */
const clearAllRateLimits = () => {
  userRateLimits.clear()
  logger.warn('All rate limits cleared')
}

module.exports = {
  geminiRateLimit,
  checkGeminiRateLimit,
  getRateLimitStatus,
  resetUserRateLimit,
  clearAllRateLimits,
}
