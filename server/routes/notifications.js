const express = require("express")
const { auth } = require("../middleware/auth")
const Notification = require("../models/Notification")

const router = express.Router()

// @route   GET /api/notifications
// @desc    Get latest 20 notifications for the authenticated user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)

    res.json({ success: true, data: notifications })
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" })
    }

    res.json({ success: true, message: "Notification marked as read", data: notification })
  } catch (error) {
    console.error("Mark notification error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

module.exports = router