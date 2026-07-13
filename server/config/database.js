const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured")
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI)

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("📦 MongoDB disconnected")
    })

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected")
    })

    return conn
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    process.exit(1)
  }
}

module.exports = connectDB
