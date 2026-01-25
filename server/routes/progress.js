const express = require("express")
const User = require("../models/User")
const Course = require("../models/Course")
const { auth } = require("../middleware/auth")

const router = express.Router()

const findLessonInCourse = (course, lessonId) => {
  if (!course?.curriculum?.length) return false

  for (const section of course.curriculum) {
    if (section?.lessons?.some((l) => l._id.toString() === lessonId)) {
      return true
    }
  }

  return false
}

const buildProgressPayload = ({ courseId, lessonId, enrollment, course }) => {
  const totalLessons = course.totalLessons || 0
  const completedLessonsCount = enrollment.completedLessons.length

  const progressPercent =
    totalLessons === 0
      ? 0
      : Math.round((completedLessonsCount / totalLessons) * 100)

  const isCompleted = totalLessons > 0 && completedLessonsCount === totalLessons

  return {
    courseId,
    lessonId: lessonId || null,
    totalLessons,
    completedLessonsCount,
    progressPercent,
    isCompleted,
    lastAccessedLesson: enrollment.lastAccessedLesson || null,
  }
}

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
      (ec) => ec.course.toString() === courseId
    )

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "User not enrolled in this course",
      })
    }

    const lessonExists = findLessonInCourse(course, lessonId)

    if (!lessonExists) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in this course",
      })
    }

    const alreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId
    )

    if (!alreadyCompleted) {
      enrollment.completedLessons.push(lessonId)
    }

    enrollment.lastAccessedLesson = lessonId

    await user.save()

    res.json({
      success: true,
      message: alreadyCompleted ? "Lesson already completed" : "Lesson marked as completed",
      data: buildProgressPayload({ courseId, lessonId, enrollment, course }),
    })
  } catch (error) {
    console.error("Lesson progress error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

/**
 * DELETE /api/progress/lesson
 * Unmarks a lesson (remove from completedLessons)
 */
router.delete("/lesson", auth, async (req, res) => {
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
      (ec) => ec.course.toString() === courseId
    )

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "User not enrolled in this course",
      })
    }

    const lessonExists = findLessonInCourse(course, lessonId)

    if (!lessonExists) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in this course",
      })
    }

    const before = enrollment.completedLessons.length

    enrollment.completedLessons = enrollment.completedLessons.filter(
      (id) => id.toString() !== lessonId
    )

    const after = enrollment.completedLessons.length

    await user.save()

    res.json({
      success: true,
      message: before === after ? "Lesson was not completed already" : "Lesson uncompleted successfully",
      data: buildProgressPayload({ courseId, lessonId, enrollment, course }),
    })
  } catch (error) {
    console.error("Uncomplete lesson error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

/**
 * GET /api/progress/course/:courseId
 * Returns progress summary of a course for the current user
 */
router.get("/course/:courseId", auth, async (req, res) => {
  try {
    const { courseId } = req.params

    const user = await User.findById(req.user._id)
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const enrollment = user.enrolledCourses.find(
      (ec) => ec.course.toString() === courseId
    )

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "User not enrolled in this course",
      })
    }

    res.json({
      success: true,
      data: buildProgressPayload({ courseId, enrollment, course }),
    })
  } catch (error) {
    console.error("Course progress error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
