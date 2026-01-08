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

        if (enrollment) {
          const totalLessons = course.totalLessons || 0
          const completed = enrollment.completedLessons.length

          course._doc.progress =
            totalLessons === 0
              ? 0
              : Math.round((completed / totalLessons) * 100)
        } else {
          course._doc.progress = 0
        }
      })
    }

    res.json({ success: true, courses })
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
    let completed = false

    if (req.user) {
      const user = await User.findById(req.user._id)
      const enrollment = user.enrolledCourses.find(
        ec => ec.course.toString() === course._id.toString()
      )

      if (enrollment) {
        isEnrolled = true

        const totalLessons = course.totalLessons || 0
        const completedCount = enrollment.completedLessons.length

        progress =
          totalLessons === 0
            ? 0
            : Math.round((completedCount / totalLessons) * 100)

        completed =
          totalLessons > 0 && completedCount === totalLessons
      }
    }

    res.json({
      success: true,
      course: {
        ...course._doc,
        isEnrolled,
        progress,
        completed,
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
      completedLessons: [],
      lastAccessedLesson: null,
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
   ❌ DEPRECATED (Phase 7)
   =========================== */
router.put("/:id/progress", auth, async (req, res) => {
  return res.status(410).json({
    success: false,
    message:
      "Percentage-based progress is deprecated. Use lesson progress API.",
  })
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
