const express = require("express")
const User = require("../models/User")
const Course = require("../models/Course")
const { auth } = require("../middleware/auth")

const router = express.Router()

/**
 * POST /api/progress/lesson
 * Marks a lesson as completed
 */
router.post("/lesson", auth, async (req, res) => {
  try {
    const { courseId, lessonId } = req.body

    if (!courseId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: "courseId and lessonId are required",
      })
    }

    const user = await User.findById(req.user._id)
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const enrollment = user.enrolledCourses.find(
      ec => ec.course.toString() === courseId
    )

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "User not enrolled in this course",
      })
    }

    // Check lesson exists in course
    let lessonExists = false

    for (const section of course.curriculum || []) {
      if (section.lessons?.some(l => l._id.toString() === lessonId)) {
        lessonExists = true
        break
      }
    }

    if (!lessonExists) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in this course",
      })
    }

    // Idempotent add
    const alreadyCompleted = enrollment.completedLessons.some(
      id => id.toString() === lessonId
    )

    if (!alreadyCompleted) {
      enrollment.completedLessons.push(lessonId)
    }

    enrollment.lastAccessedLesson = lessonId

    await user.save()

    // 🔢 DERIVED progress
    const totalLessons = course.totalLessons
    const completedCount = enrollment.completedLessons.length

    const progress =
      totalLessons === 0
        ? 0
        : Math.round((completedCount / totalLessons) * 100)

    const completed = completedCount === totalLessons && totalLessons > 0

    res.json({
      success: true,
      data: {
        courseId,
        lessonId,
        completedLessons: completedCount,
        totalLessons,
        progress,
        completed,
      },
    })
  } catch (error) {
    console.error("Lesson progress error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
