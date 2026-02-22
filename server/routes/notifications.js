const express = require("express")
const { auth } = require("../middleware/auth")
const User = require("../models/User")

const router = express.Router()

// Get user notifications
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("notifications")

    res.json({
      success: true,
      data: user.notifications
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

// Mark notification as read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    const notification = user.notifications.id(req.params.id)

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      })
    }

    notification.isRead = true
    await user.save()

    res.json({
      success: true,
      message: "Notification marked as read"
    })
  } catch (error) {
    console.error("Mark notification error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})

module.exports = router