const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const compression = require("compression")
const morgan = require("morgan")
require("dotenv").config()

// Route imports
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const courseRoutes = require("./routes/courses")
const dashboardRoutes = require("./routes/dashboard")
const progressRoutes = require("./routes/progress")
const communityRoutes = require("./routes/community")
const earnRoutes = require("./routes/earn")
const analyticsRoutes = require("./routes/analytics")

// DB connection
const connectDB = require("./config/database")

const app = express()

/* ===========================
   DATABASE
   =========================== */
connectDB()

/* ===========================
   SECURITY & CORE MIDDLEWARE
   =========================== */
app.use(helmet())

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

// ✅ BODY PARSING — MUST COME BEFORE ROUTES
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

app.use(compression())

/* ===========================
   LOGGING
   =========================== */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
} else {
  app.use(morgan("combined"))
}

/* ===========================
   RATE LIMITING
   =========================== */
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
})
app.use("/api/", limiter)

/* ===========================
   ROUTES
   =========================== */
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/progress", progressRoutes)
app.use("/api/community", communityRoutes)
app.use("/api/earn", earnRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/lessons", require("./routes/lessons"))


/* ===========================
   HEALTH CHECK
   =========================== */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

/* ===========================
   404 HANDLER
   =========================== */
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  })
})

/* ===========================
   GLOBAL ERROR HANDLER
   =========================== */
app.use((error, req, res, next) => {
  console.error("❌ Server Error:", error)

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: Object.values(error.errors).map(e => e.message),
    })
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    })
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    })
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    })
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
})

/* ===========================
   SERVER START
   =========================== */
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Environment: ${process.env.NODE_ENV}`)
  console.log(`🔗 API URL: http://localhost:${PORT}/api`)
})

/* ===========================
   GRACEFUL SHUTDOWN
   =========================== */
process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)

function shutdown() {
  console.log("👋 Shutting down gracefully")
  mongoose.connection.close(() => {
    console.log("📦 MongoDB connection closed")
    process.exit(0)
  })
}
