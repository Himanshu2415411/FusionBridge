const express = require("express")
const Course = require("../models/Course")
const User = require("../models/User")
const { auth, optionalAuth, authorize } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")

const router = express.Router()

/* ===========================
   GET /api/courses
   =========================== */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("instructor", "firstName lastName avatar")
      .sort({ createdAt: -1 })

    if (req.user) {
      const user = await User.findById(req.user._id)
      courses.forEach(course => {
        const enrollment = user.enrolledCourses.find(
          ec => ec.course.toString() === course._id.toString()
        )
        course._doc.isEnrolled = !!enrollment
        course._doc.progress = enrollment ? enrollment.progress : 0
      })
    }

    res.json({
      success: true,
      courses,
    })
  } catch (error) {
    console.error("Get courses error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

/* ===========================
   GET /api/courses/:id
   =========================== */
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "firstName lastName avatar bio")

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    let isEnrolled = false
    let progress = 0

    if (req.user) {
      const user = await User.findById(req.user._id)
      const enrollment = user.enrolledCourses.find(
        ec => ec.course.toString() === course._id.toString()
      )
      isEnrolled = !!enrollment
      progress = enrollment ? enrollment.progress : 0
    }

    res.json({
      success: true,
      course: {
        ...course._doc,
        isEnrolled,
        progress,
      },
    })
  } catch (error) {
    console.error("Get course error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

/* ===========================
   POST /api/courses/:id/enroll
   =========================== */
router.post("/:id/enroll", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const user = await User.findById(req.user._id)

    const alreadyEnrolled = user.enrolledCourses.find(
      ec => ec.course.toString() === course._id.toString()
    )

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      })
    }

    user.enrolledCourses.push({
      course: course._id,
      enrolledAt: new Date(),
      progress: 0,
    })

    course.studentsEnrolled += 1

    await user.save()
    await course.save()

    res.json({
      success: true,
      message: "Course enrolled successfully",
      courseId: course._id,
    })
  } catch (error) {
    console.error("Enroll error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

/* ===========================
   PUT /api/courses/:id/progress
   =========================== */
router.put("/:id/progress", auth, async (req, res) => {
  try {
    const { progress } = req.body

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: "Progress must be between 0 and 100",
      })
    }

    const user = await User.findById(req.user._id)
    const enrollment = user.enrolledCourses.find(
      ec => ec.course.toString() === req.params.id
    )

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: "Not enrolled in this course",
      })
    }

    enrollment.progress = progress

    if (progress === 100 && !enrollment.completed) {
      enrollment.completed = true
      enrollment.completedAt = new Date()
      user.coursesCompleted += 1
    }

    await user.save()

    res.json({
      success: true,
      message: "Progress updated",
      progress,
    })
  } catch (error) {
    console.error("Progress error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

/* ===========================
   POST /api/courses
   (Admin / Instructor)
   =========================== */
router.post(
  "/",
  [
    auth,
    authorize("admin", "instructor"),
    body("title").isLength({ min: 5 }),
    body("description").isLength({ min: 20 }),
    body("category").notEmpty(),
    body("level").isIn(["beginner", "intermediate", "advanced"]),
    body("price").isNumeric(),
    body("duration").isNumeric(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

      const course = new Course({
        ...req.body,
        instructor: req.user._id,
      })

      await course.save()

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        course,
      })
    } catch (error) {
      console.error("Create course error:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  }
)

module.exports = router
