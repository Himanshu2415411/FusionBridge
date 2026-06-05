/**
 * Central configuration file for server
 * All environment variables are loaded and validated here
 */

require("dotenv").config()

const config = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  API_BASE_URL: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`,

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Database
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/fusionbridge",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-key-change-in-production",
  JWT_EXPIRE: "7d",

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Video Configuration
  VIDEO_EXPIRY_HOURS: parseInt(process.env.VIDEO_EXPIRY_HOURS || "24"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  // Gemini AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  GEMINI_RATE_LIMIT_DAILY: parseInt(process.env.GEMINI_RATE_LIMIT_DAILY || "1500"),
  GEMINI_COST_MONITORING_ENABLED: process.env.GEMINI_COST_MONITORING_ENABLED === "true",
  GEMINI_CACHE_TTL_SECONDS: parseInt(process.env.GEMINI_CACHE_TTL_SECONDS || "86400"),
  GEMINI_CACHE_ENABLED: process.env.GEMINI_CACHE_ENABLED === "true",
  GEMINI_LOG_API_CALLS: process.env.GEMINI_LOG_API_CALLS === "true",

  // Feature Flags
  FEATURE_AI_QUIZ_GENERATION: process.env.FEATURE_AI_QUIZ_GENERATION === "true",
  FEATURE_AI_CHATBOT: process.env.FEATURE_AI_CHATBOT === "true",
  FEATURE_AI_SUMMARIZATION: process.env.FEATURE_AI_SUMMARIZATION === "true",
  FEATURE_AI_CODE_REVIEW: process.env.FEATURE_AI_CODE_REVIEW === "true",

  // Derived values
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isStaging: process.env.NODE_ENV === "staging",
}

// Validate critical environment variables
const requiredInProduction = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
]

if (config.isProduction) {
  const missing = requiredInProduction.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(", ")}`
    )
  }
}

module.exports = config
