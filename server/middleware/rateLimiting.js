/**
 * Rate Limiting Configuration
 * Different rate limits for different endpoint types
 */

const rateLimit = require("express-rate-limit")
const RedisStore = require("rate-limit-redis")
const redis = require("redis")

// Redis client for storing rate limit data
// Falls back to memory store if Redis unavailable
let redisClient = null
try {
  redisClient = redis.createClient({
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  })
  redisClient.on("error", (err) => console.log("Redis error:", err))
} catch (error) {
  console.log("Redis not available, using memory store for rate limiting")
}

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: "rl:api:",
      })
    : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Authentication rate limiter
 * Stricter: 5 requests per 15 minutes per IP
 * Prevents brute force login/registration attacks
 */
const authLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: "rl:auth:",
      })
    : undefined,
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 attempts per 15 min
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Upload rate limiter
 * Moderate: 10 requests per hour per user
 * Prevents storage abuse
 */
const uploadLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: "rl:upload:",
      })
    : undefined,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: "Upload limit exceeded, please try again later.",
  keyGenerator: (req, res) => req.user?._id || req.ip, // Rate limit by user if authenticated
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Search rate limiter
 * 30 requests per minute per user
 */
const searchLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: "rl:search:",
      })
    : undefined,
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: "Too many search requests, please slow down.",
  keyGenerator: (req, res) => req.user?._id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Quiz submission rate limiter
 * 1 request per minute per user per course
 * Prevents rapid quiz resubmissions
 */
const quizLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: "rl:quiz:",
      })
    : undefined,
  windowMs: 60 * 1000, // 1 minute
  max: 1, // 1 submission per minute
  message: "Please wait before submitting another quiz attempt.",
  keyGenerator: (req, res) => `${req.user?._id}:${req.params.courseId}`,
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * XP action rate limiter
 * Prevents exploiting XP system with rapid requests
 * 5 actions per 10 minutes per user
 */
const xpActionLimiter = rateLimit({
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: "rl:xp:",
      })
    : undefined,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 XP-earning actions per 10 min
  message: "Too many actions, please slow down.",
  keyGenerator: (req, res) => req.user?._id,
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  searchLimiter,
  quizLimiter,
  xpActionLimiter,
}
