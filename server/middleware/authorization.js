/**
 * Authorization Middleware
 * Checks permissions for course access, enrollment, and instructor status
 */

const Course = require("../models/Course")
const User = require("../models/User")
const { ApiResponse } = require("../utils/apiResponse")

/**
 * Verify user is course instructor
 * Middleware for course modification endpoints
 * Route params: courseId required
 */
const isCourseInstructor = async (req, res, next) => {
  try {
    const { courseId } = req.params
    const userId = req.user._id

    if (!courseId) {
      return res.status(400).json(
        new ApiResponse(400, null, "Course ID is required").toJSON()
      )
    }

    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json(
        new ApiResponse(404, null, "Course not found").toJSON()
      )
    }

    if (course.instructor.toString() !== userId.toString()) {
      return res.status(403).json(
        new ApiResponse(403, null, "Only course instructor can modify this course").toJSON()
      )
    }

    req.course = course
    next()
  } catch (error) {
    console.error("Course instructor check error:", error)
    res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
}

/**
 * Verify user is enrolled in course
 * Middleware for lesson access endpoints
 * Route params: courseId required
 */
const isEnrolledInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params || req.body
    const userId = req.user._id

    if (!courseId) {
      return res.status(400).json(
        new ApiResponse(400, null, "Course ID is required").toJSON()
      )
    }

    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json(
        new ApiResponse(404, null, "Course not found").toJSON()
      )
    }

    const user = await User.findById(userId)
    const isEnrolled = user.enrolledCourses.some(
      ec => ec.course.toString() === courseId
    )

    if (!isEnrolled) {
      return res.status(403).json(
        new ApiResponse(403, null, "You are not enrolled in this course").toJSON()
      )
    }

    req.course = course
    next()
  } catch (error) {
    console.error("Course enrollment check error:", error)
    res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
}

/**
 * Verify lesson belongs to course and user has access
 * Middleware for lesson-specific endpoints
 * Route params: courseId, lessonId required
 */
const canAccessLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params
    const userId = req.user._id

    if (!courseId || !lessonId) {
      return res.status(400).json(
        new ApiResponse(400, null, "Course ID and Lesson ID are required").toJSON()
      )
    }

    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json(
        new ApiResponse(404, null, "Course not found").toJSON()
      )
    }

    // Find lesson in course curriculum
    let lessonFound = false
    let lessonData = null

    for (const section of course.curriculum || []) {
      for (const lesson of section.lessons || []) {
        if (lesson._id.toString() === lessonId) {
          lessonFound = true
          lessonData = lesson
          break
        }
      }
      if (lessonFound) break
    }

    if (!lessonFound) {
      return res.status(404).json(
        new ApiResponse(404, null, "Lesson not found in this course").toJSON()
      )
    }

    // Check if lesson is preview (public) or requires enrollment
    if (!lessonData.isPreview) {
      const user = await User.findById(userId)
      const isEnrolled = user.enrolledCourses.some(
        ec => ec.course.toString() === courseId
      )

      if (!isEnrolled) {
        return res.status(403).json(
          new ApiResponse(403, null, "You must be enrolled to access this lesson").toJSON()
        )
      }
    }

    req.course = course
    req.lesson = lessonData
    next()
  } catch (error) {
    console.error("Lesson access check error:", error)
    res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
}

/**
 * Verify user owns progress record
 * Middleware for progress update endpoints
 */
const ownsProgressRecord = async (req, res, next) => {
  try {
    const { courseId } = req.params || req.body
    const userId = req.user._id

    if (!courseId) {
      return res.status(400).json(
        new ApiResponse(400, null, "Course ID is required").toJSON()
      )
    }

    const user = await User.findById(userId)
    const enrollment = user.enrolledCourses.find(
      ec => ec.course.toString() === courseId
    )

    if (!enrollment) {
      return res.status(403).json(
        new ApiResponse(403, null, "No progress record found for this course").toJSON()
      )
    }

    req.enrollment = enrollment
    next()
  } catch (error) {
    console.error("Progress ownership check error:", error)
    res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
}

/**
 * Verify user has specific role
 * Usage: app.use(hasRole(['instructor', 'admin']))
 */
const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        new ApiResponse(401, null, "Authentication required").toJSON()
      )
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(
        new ApiResponse(403, null, `Access denied. Required roles: ${allowedRoles.join(", ")}`).toJSON()
      )
    }

    next()
  }
}

module.exports = {
  isCourseInstructor,
  isEnrolledInCourse,
  canAccessLesson,
  ownsProgressRecord,
  hasRole,
}
