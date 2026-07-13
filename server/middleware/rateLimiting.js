/**
 * Rate Limiting Configuration
 * Uses Express built-in memory store (no Redis required)
 */

const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Authentication rate limiter
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Upload limiter
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Upload limit exceeded, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Search limiter
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many search requests, please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Quiz limiter
 */
const quizLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: "Please wait before submitting another quiz attempt.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * XP limiter
 */
const xpActionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many actions, please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  searchLimiter,
  quizLimiter,
  xpActionLimiter,
};