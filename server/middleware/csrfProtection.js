/**
 * CSRF Protection Middleware
 * Generates and validates CSRF tokens for state-changing requests
 */

const csrf = require("csurf")
const session = require("express-session")
const MongoStore = require("connect-mongo")

// CSRF protection middleware
const csrfProtection = csrf({ cookie: false })

/**
 * Get CSRF token endpoint
 * Route: GET /api/csrf-token
 * Access: Public
 * Returns: CSRF token to include in future requests
 */
const getCsrfToken = (req, res) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken(),
  })
}

/**
 * Session configuration for CSRF
 * Stores session data in MongoDB
 */
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600, // Lazy session update (24h)
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    httpOnly: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}

module.exports = {
  csrfProtection,
  getCsrfToken,
  sessionConfig,
}
